import { AirtableService } from './airtable-service';
import { IStorage } from './storage';
import { AirtableSyncQueue, Invoice, InvoiceItem } from '../shared/schema';

export class AirtableSyncWorker {
  private storage: IStorage;
  private isProcessing = false;
  private processingInterval: NodeJS.Timeout | null = null;

  constructor(storage: IStorage) {
    this.storage = storage;
  }

  /**
   * Inicia el worker de sincronización que procesa la cola cada 30 segundos
   */
  start(): void {
    if (this.processingInterval) {
      return; // Ya está corriendo
    }

    console.log('🚀 Iniciando worker de sincronización con Airtable...');
    
    // Procesar inmediatamente al iniciar
    this.processQueue().catch(error => {
      console.error('Error en procesamiento inicial:', error);
    });

    // Luego procesar cada 30 segundos
    this.processingInterval = setInterval(() => {
      this.processQueue().catch(error => {
        console.error('Error en procesamiento periódico:', error);
      });
    }, 30000);
  }

  /**
   * Detiene el worker de sincronización
   */
  stop(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
      console.log('⏹️ Worker de sincronización detenido');
    }
  }

  /**
   * Procesa manualmente la cola de sincronización
   */
  async processQueue(): Promise<void> {
    if (this.isProcessing) {
      console.log('⏳ Sincronización ya en proceso, saltando...');
      return;
    }

    try {
      this.isProcessing = true;
      
      // Verificar si la integración está habilitada
      const config = await this.storage.getAirtableConfig();
      if (!config || !config.enabled || !config.apiToken || !config.baseId) {
        // Sincronización no configurada, no hacer nada
        return;
      }

      // Actualizar estado de configuración a 'syncing'
      await this.storage.updateAirtableConfig({
        ...config,
        syncStatus: 'syncing'
      });

      const airtableService = new AirtableService(config);
      
      // Obtener elementos pendientes de la cola
      const pendingItems = await this.storage.getAirtableSyncQueueItems('pending');
      
      if (pendingItems.length === 0) {
        await this.storage.updateAirtableConfig({
          ...config,
          syncStatus: 'idle',
          lastError: null
        });
        return;
      }

      console.log(`📋 Procesando ${pendingItems.length} elementos en la cola de Airtable...`);

      let processedCount = 0;
      let errorCount = 0;

      for (const item of pendingItems) {
        try {
          await this.processSyncItem(item, airtableService);
          processedCount++;
        } catch (error) {
          errorCount++;
          console.error(`❌ Error procesando item ${item.id}:`, error);
        }
      }

      // Actualizar estado final de la configuración
      const finalStatus = errorCount > 0 ? 'error' : 'idle';
      const lastError = errorCount > 0 ? `Errores en ${errorCount} de ${pendingItems.length} items` : null;

      await this.storage.updateAirtableConfig({
        ...config,
        syncStatus: finalStatus,
        lastSyncDate: new Date(),
        lastError: lastError
      });

      console.log(`✅ Sincronización completada: ${processedCount} exitosos, ${errorCount} errores`);

    } catch (error) {
      console.error('💥 Error crítico en worker de sincronización:', error);
      
      // Intentar actualizar el estado de error en la configuración
      try {
        const config = await this.storage.getAirtableConfig();
        if (config) {
          await this.storage.updateAirtableConfig({
            ...config,
            syncStatus: 'error',
            lastError: error instanceof Error ? error.message : 'Error desconocido'
          });
        }
      } catch (updateError) {
        console.error('No se pudo actualizar estado de error:', updateError);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Procesa un elemento individual de la cola
   */
  private async processSyncItem(item: AirtableSyncQueue, airtableService: AirtableService): Promise<void> {
    try {
      let externalId: string;

      if (item.entityType === 'invoice') {
        // Obtener la factura del almacenamiento
        const invoice = await this.getInvoiceById(item.entityId);
        if (!invoice) {
          throw new Error(`Factura ${item.entityId} no encontrada`);
        }

        if (item.externalId) {
          // Ya existe en Airtable, actualizar
          await airtableService.updateInvoice(item.externalId, invoice);
          externalId = item.externalId;
        } else {
          // Crear nueva en Airtable
          externalId = await airtableService.syncInvoice(invoice);
        }

      } else if (item.entityType === 'invoice_item') {
        // Obtener el item de factura del almacenamiento
        const invoiceItem = await this.getInvoiceItemById(item.entityId);
        if (!invoiceItem) {
          throw new Error(`Item de factura ${item.entityId} no encontrado`);
        }

        // Buscar si la factura padre ya está sincronizada
        const parentInvoiceSyncItem = await this.storage.getAirtableSyncQueueItems('synced', 'invoice');
        const parentSync = parentInvoiceSyncItem.find(sync => sync.entityId === invoiceItem.invoiceId);
        const airtableInvoiceId = parentSync?.externalId || undefined;

        externalId = await airtableService.syncInvoiceItem(invoiceItem, airtableInvoiceId);

      } else {
        throw new Error(`Tipo de entidad no soportado: ${item.entityType}`);
      }

      // Marcar como sincronizado exitosamente
      await this.storage.updateAirtableSyncQueueItem(item.id, {
        status: 'synced',
        externalId: externalId,
        lastSyncedAt: new Date(),
        lastError: null
      });

      console.log(`✅ Sincronizado ${item.entityType} ${item.entityId} -> ${externalId}`);

    } catch (error) {
      // Incrementar el contador de reintentos
      const newRetries = (item.retries || 0) + 1;
      const maxRetries = item.maxRetries || 3;

      if (newRetries >= maxRetries) {
        // Marcar como error permanente
        await this.storage.updateAirtableSyncQueueItem(item.id, {
          status: 'error',
          retries: newRetries,
          lastError: error instanceof Error ? error.message : 'Error desconocido'
        });
        console.error(`❌ Item ${item.id} falló permanentemente después de ${newRetries} intentos`);
      } else {
        // Marcar para reintento
        await this.storage.updateAirtableSyncQueueItem(item.id, {
          retries: newRetries,
          lastError: error instanceof Error ? error.message : 'Error desconocido'
        });
        console.warn(`⚠️ Item ${item.id} falló (intento ${newRetries}/${maxRetries}), reintentando...`);
      }

      throw error; // Re-lanzar para que se cuente en las estadísticas
    }
  }

  /**
   * Obtiene una factura por ID desde el almacenamiento
   */
  private async getInvoiceById(id: string): Promise<Invoice | undefined> {
    return await this.storage.getInvoice(id);
  }

  /**
   * Obtiene un item de factura por ID desde el almacenamiento
   */
  private async getInvoiceItemById(id: string): Promise<InvoiceItem | undefined> {
    // Buscar en todas las facturas hasta encontrar el item por ID
    const allInvoices = await this.storage.getInvoices();
    
    for (const invoice of allInvoices) {
      const items = await this.storage.getInvoiceItems(invoice.id);
      const foundItem = items.find(item => item.id === id);
      if (foundItem) {
        return foundItem;
      }
    }
    
    return undefined;
  }

  /**
   * Añade una factura a la cola de sincronización
   */
  async queueInvoiceSync(invoiceId: string): Promise<void> {
    await this.storage.createAirtableSyncQueueItem({
      entityType: 'invoice',
      entityId: invoiceId,
      status: 'pending'
    });
    console.log(`📥 Factura ${invoiceId} añadida a la cola de sincronización`);
  }

  /**
   * Añade un item de factura a la cola de sincronización
   */
  async queueInvoiceItemSync(itemId: string): Promise<void> {
    await this.storage.createAirtableSyncQueueItem({
      entityType: 'invoice_item',
      entityId: itemId,
      status: 'pending'
    });
    console.log(`📥 Item ${itemId} añadido a la cola de sincronización`);
  }
}