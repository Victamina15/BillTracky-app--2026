import { AirtableConfig, Invoice, InvoiceItem } from "../shared/schema";

interface AirtableField {
  [key: string]: any;
}

interface AirtableRecord {
  id?: string;
  fields: AirtableField;
}

interface AirtableResponse {
  records: AirtableRecord[];
}

interface AirtableCreateResponse {
  records: {
    id: string;
    fields: AirtableField;
  }[];
}

export class AirtableService {
  private config: AirtableConfig;
  private baseUrl: string;

  constructor(config: AirtableConfig) {
    if (!config.apiToken || !config.baseId) {
      throw new Error("Configuración de Airtable incompleta");
    }
    this.config = config;
    this.baseUrl = `https://api.airtable.com/v0/${config.baseId}`;
  }

  private async makeRequest(
    method: string,
    endpoint: string,
    data?: any
  ): Promise<any> {
    const url = `${this.baseUrl}/${endpoint}`;
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.config.apiToken}`,
      'Content-Type': 'application/json'
    };

    const options: RequestInit = {
      method,
      headers
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error de Airtable (${response.status}): ${errorText}`);
    }

    return response.json();
  }

  async syncInvoice(invoice: Invoice): Promise<string> {
    try {
      const invoiceFields = {
        'Invoice ID': invoice.id,
        'Number': invoice.number,
        'Date': invoice.date?.toISOString() || new Date().toISOString(),
        'Customer Name': invoice.customerName || 'Cliente',
        'Customer Phone': invoice.customerPhone,
        'Subtotal': parseFloat(invoice.subtotal || '0'),
        'Tax': parseFloat(invoice.tax || '0'),
        'Total': parseFloat(invoice.total || '0'),
        'Payment Method': invoice.paymentMethod || 'pending',
        'Status': invoice.status || 'received'
      };

      const createData = {
        records: [{
          fields: invoiceFields
        }]
      };

      const response: AirtableCreateResponse = await this.makeRequest(
        'POST',
        this.config.tableInvoices || 'Invoices',
        createData
      );

      if (response.records && response.records.length > 0) {
        return response.records[0].id;
      }

      throw new Error('No se recibió ID de registro de Airtable');
    } catch (error) {
      console.error('Error sincronizando factura en Airtable:', error);
      throw error;
    }
  }

  async syncInvoiceItem(item: InvoiceItem, airtableInvoiceId?: string): Promise<string> {
    try {
      const itemFields: Record<string, any> = {
        'Item ID': item.id,
        'Invoice ID': item.invoiceId,
        'Service Name': item.serviceName || 'Servicio',
        'Service Type': item.serviceType || 'wash',
        'Quantity': item.quantity || 1,
        'Unit Price': parseFloat(item.unitPrice || '0'),
        'Total': parseFloat(item.total || '0')
      };

      // Si tenemos el ID de Airtable de la factura, lo relacionamos
      if (airtableInvoiceId) {
        itemFields['Invoice'] = [airtableInvoiceId];
      }

      const createData = {
        records: [{
          fields: itemFields
        }]
      };

      const response: AirtableCreateResponse = await this.makeRequest(
        'POST',
        this.config.tableInvoiceItems || 'Invoice Items',
        createData
      );

      if (response.records && response.records.length > 0) {
        return response.records[0].id;
      }

      throw new Error('No se recibió ID de registro de Airtable');
    } catch (error) {
      console.error('Error sincronizando item en Airtable:', error);
      throw error;
    }
  }

  async updateInvoice(airtableId: string, invoice: Invoice): Promise<void> {
    try {
      const invoiceFields = {
        'Invoice ID': invoice.id,
        'Number': invoice.number,
        'Date': invoice.date?.toISOString() || new Date().toISOString(),
        'Customer Name': invoice.customerName || 'Cliente',
        'Customer Phone': invoice.customerPhone,
        'Subtotal': parseFloat(invoice.subtotal || '0'),
        'Tax': parseFloat(invoice.tax || '0'),
        'Total': parseFloat(invoice.total || '0'),
        'Payment Method': invoice.paymentMethod || 'pending',
        'Status': invoice.status || 'received'
      };

      const updateData = {
        records: [{
          id: airtableId,
          fields: invoiceFields
        }]
      };

      await this.makeRequest(
        'PATCH',
        this.config.tableInvoices || 'Invoices',
        updateData
      );
    } catch (error) {
      console.error('Error actualizando factura en Airtable:', error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      // Hacemos una consulta simple para probar la conexión
      await this.makeRequest('GET', `${this.config.tableInvoices || 'Invoices'}?maxRecords=1`);
      return true;
    } catch (error) {
      console.error('Error probando conexión con Airtable:', error);
      return false;
    }
  }
}