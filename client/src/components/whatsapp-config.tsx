import { useState } from 'react';
import { 
  ArrowLeft, 
  Save, 
  MessageCircle, 
  Send, 
  Eye, 
  Copy, 
  RotateCcw, 
  FileText, 
  Clock, 
  CheckCircle, 
  DollarSign, 
  X,
  Smartphone,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface MensajeBase {
  activo: boolean;
  titulo: string;
  mensaje: string;
}

interface PedidoListo extends MensajeBase {
  envioAutomatico: boolean;
  horaEnvio: string;
}

interface FacturaWhatsApp extends MensajeBase {
  incluirDetalles: boolean;
  formatoDetalles: string;
}

interface Recordatorios extends MensajeBase {
  diasAntes: number;
}

interface PagosPendientes extends MensajeBase {
  diasRecordatorio: number;
}

interface ConfiguracionMensajes {
  pedidoListo: PedidoListo;
  facturaWhatsApp: FacturaWhatsApp;
  recordatorios: Recordatorios;
  pagosPendientes: PagosPendientes;
}

interface Variables {
  [key: string]: string;
}

interface TipoMenu {
  key: keyof ConfiguracionMensajes;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface PlantillasMessages {
  [key: string]: {
    [tipo: string]: string;
  };
}

interface WhatsAppConfigProps {
  onBack?: () => void;
}

export default function WhatsAppConfig({ onBack }: WhatsAppConfigProps) {
  const [configuracion, setConfiguracion] = useState<ConfiguracionMensajes>({
    pedidoListo: {
      activo: true,
      titulo: "🎉 ¡Tu pedido está listo!",
      mensaje: `Hola {cliente_nombre}! 👋

¡Excelentes noticias! Tu pedido #{factura_numero} está listo para recoger.

📋 *Detalles del pedido:*
• Fecha de entrega: {fecha_entrega}
• Total de prendas: {total_prendas}
• Total a pagar: RD$ {total_pagar}

🏪 *Información de recogida:*
• Dirección: {empresa_direccion}
• Horario: {empresa_horario}
• Teléfono: {empresa_telefono}

¡Gracias por confiar en nosotros! ✨

_{empresa_nombre}_`,
      envioAutomatico: true,
      horaEnvio: "09:00"
    },
    facturaWhatsApp: {
      activo: true,
      titulo: "📄 Factura de tu pedido",
      mensaje: `Hola {cliente_nombre}! 👋

Aquí tienes la factura de tu pedido #{factura_numero}

📋 *Resumen del pedido:*
• Fecha: {fecha_factura}
• Prendas: {total_prendas}
• Subtotal: RD$ {subtotal}
• ITBIS (18%): RD$ {itbis}
• *Total: RD$ {total}*

💳 *Estado del pago:* {estado_pago}
📅 *Fecha de entrega:* {fecha_entrega}

{detalles_articulos}

¡Gracias por elegirnos! 🙏

_{empresa_nombre}_
📍 {empresa_direccion}
📞 {empresa_telefono}`,
      incluirDetalles: true,
      formatoDetalles: "• {cantidad}x {prenda} - {servicio} - RD$ {precio}"
    },
    recordatorios: {
      activo: true,
      diasAntes: 1,
      titulo: "⏰ Recordatorio de entrega",
      mensaje: `Hola {cliente_nombre}! 👋

Te recordamos que mañana {fecha_entrega} es la fecha de entrega de tu pedido #{factura_numero}

📋 *Detalles:*
• Total de prendas: {total_prendas}
• Total: RD$ {total_pagar}
• Estado: {estado_pedido}

🏪 *Horario de atención:*
{empresa_horario}

¡Te esperamos! 😊

_{empresa_nombre}_`
    },
    pagosPendientes: {
      activo: false,
      diasRecordatorio: 3,
      titulo: "💰 Recordatorio de pago pendiente",
      mensaje: `Hola {cliente_nombre}! 👋

Tienes un pago pendiente por tu pedido #{factura_numero}

💳 *Detalles del pago:*
• Monto pendiente: RD$ {monto_pendiente}
• Fecha del pedido: {fecha_factura}
• Días pendiente: {dias_pendiente}

🏪 Puedes realizar el pago en:
📍 {empresa_direccion}
📞 {empresa_telefono}

¡Gracias por tu comprensión! 🙏

_{empresa_nombre}_`
    }
  });

  const [tipoMensaje, setTipoMensaje] = useState<keyof ConfiguracionMensajes>('pedidoListo');
  const [vistaPrevia, setVistaPrevia] = useState<boolean>(false);
  const [mensajePreview, setMensajePreview] = useState<string>('');
  const [canalPreview, setCanalPreview] = useState<'whatsapp' | 'email'>('whatsapp');
  const { toast } = useToast();

  const variables: Variables = {
    cliente_nombre: "María González",
    factura_numero: "FAC-2024-001234",
    fecha_entrega: "15 de Enero, 2024",
    fecha_factura: "12 de Enero, 2024",
    total_prendas: "8",
    total_pagar: "850.00",
    total: "850.00",
    subtotal: "720.34",
    itbis: "129.66",
    estado_pago: "Pagado ✅",
    estado_pedido: "Listo para entrega",
    monto_pendiente: "425.00",
    dias_pendiente: "3",
    empresa_nombre: "CleanWash Lavandería",
    empresa_direccion: "Av. 27 de Febrero #123, Santo Domingo",
    empresa_telefono: "(809) 555-0123",
    empresa_horario: "Lun-Vie: 8:00 AM - 6:00 PM\nSáb: 8:00 AM - 2:00 PM",
    detalles_articulos: "• 2x Camisa - Lavado y Planchado - RD$ 120.00\n• 1x Pantalón - Lavado y Planchado - RD$ 80.00\n• 3x Camiseta - Solo Lavado - RD$ 150.00\n• 2x Vestido - Completo - RD$ 500.00"
  };

  const plantillasMessages: PlantillasMessages = {
    pedidoListo: {
      simple: `Hola {cliente_nombre}! Tu pedido #{factura_numero} está listo para recoger. Total: RD$ {total_pagar}. {empresa_nombre}`,
      profesional: `Estimado/a {cliente_nombre}, le informamos que su pedido #{factura_numero} está listo para ser retirado. Monto total: RD$ {total_pagar}. Horario: {empresa_horario}. {empresa_nombre}`,
      amigable: `¡Hola {cliente_nombre}! 🎉 ¡Tu ropa está lista y te quedó increíble! Pedido #{factura_numero} - Total: RD$ {total_pagar}. ¡Te esperamos! ✨ {empresa_nombre}`
    },
    facturaWhatsApp: {
      simple: `Factura #{factura_numero} - {cliente_nombre}. Total: RD$ {total} - {estado_pago}. {empresa_nombre}`,
      profesional: `Estimado/a {cliente_nombre}, adjuntamos la factura #{factura_numero} por un monto de RD$ {total}. Estado: {estado_pago}. {empresa_nombre}`,
      detallado: `Factura #{factura_numero}\nCliente: {cliente_nombre}\nPrendas: {total_prendas}\nSubtotal: RD$ {subtotal}\nITBIS: RD$ {itbis}\nTotal: RD$ {total}\nEstado: {estado_pago}\n{empresa_nombre}`
    }
  };

  const tiposMenu: TipoMenu[] = [
    { key: 'pedidoListo', label: 'Pedido Listo', icon: CheckCircle, color: 'text-green-600' },
    { key: 'facturaWhatsApp', label: 'Factura WhatsApp', icon: FileText, color: 'text-blue-600' },
    { key: 'recordatorios', label: 'Recordatorios', icon: Clock, color: 'text-orange-600' },
    { key: 'pagosPendientes', label: 'Pagos Pendientes', icon: DollarSign, color: 'text-red-600' }
  ];

  const reemplazarVariables = (mensaje: string): string => {
    let resultado = mensaje;
    Object.keys(variables).forEach(variable => {
      const regex = new RegExp(`{${variable}}`, 'g');
      resultado = resultado.replace(regex, variables[variable]);
    });
    return resultado;
  };

  const mostrarVistaPrevia = (): void => {
    const mensaje = configuracion[tipoMensaje].mensaje;
    setMensajePreview(reemplazarVariables(mensaje));
    setVistaPrevia(true);
  };

  const aplicarPlantilla = (plantilla: string): void => {
    setConfiguracion({
      ...configuracion,
      [tipoMensaje]: {
        ...configuracion[tipoMensaje],
        mensaje: plantilla
      }
    });
  };

  const copiarMensaje = (): void => {
    navigator.clipboard.writeText(mensajePreview);
    toast({
      title: "Copiado",
      description: "Mensaje copiado al portapapeles",
    });
  };

  const enviarPruebaWhatsApp = (): void => {
    const numeroEjemplo = "18091234567";
    const mensaje = encodeURIComponent(mensajePreview);
    const url = `https://wa.me/${numeroEjemplo}?text=${mensaje}`;
    window.open(url, '_blank');
  };

  const restaurarDefecto = (): void => {
    toast({
      title: "Mensaje restaurado",
      description: "Se ha restaurado el mensaje por defecto",
    });
  };

  const guardarConfiguracion = (): void => {
    toast({
      title: "Configuración guardada",
      description: "Configuración de mensajes guardada exitosamente",
    });
  };

  const updateConfiguracion = (campo: string, valor: any): void => {
    setConfiguracion({
      ...configuracion,
      [tipoMensaje]: {
        ...configuracion[tipoMensaje],
        [campo]: valor
      }
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {onBack && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onBack}
                    className="mr-3"
                    data-testid="button-back-whatsapp-config"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver
                  </Button>
                )}
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Configuración de Mensajes</h1>
                  <p className="text-muted-foreground">WhatsApp y notificaciones automáticas</p>
                </div>
              </div>
              <Button
                onClick={guardarConfiguracion}
                data-testid="button-save-whatsapp-config"
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Menu Lateral */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tipos de Mensaje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {tiposMenu.map((tipo) => {
                const IconoTipo = tipo.icon;
                return (
                  <Button
                    key={tipo.key}
                    variant={tipoMensaje === tipo.key ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setTipoMensaje(tipo.key)}
                    data-testid={`tab-message-${tipo.key}`}
                  >
                    <IconoTipo className={`w-4 h-4 mr-2 ${tipo.color}`} />
                    {tipo.label}
                    {configuracion[tipo.key].activo && (
                      <Badge className="ml-auto w-2 h-2 p-0 bg-green-500" />
                    )}
                  </Button>
                );
              })}

              {/* Variables Disponibles */}
              <div className="mt-8">
                <h4 className="text-sm font-semibold mb-3">Variables Disponibles</h4>
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {Object.keys(variables).map((variable) => (
                    <button
                      key={variable}
                      className="block w-full text-xs bg-muted px-2 py-1 rounded text-left hover:bg-muted/80 transition-colors"
                      onClick={() => {
                        navigator.clipboard.writeText(`{${variable}}`);
                        toast({
                          title: "Variable copiada",
                          description: `Variable {${variable}} copiada al portapapeles`,
                        });
                      }}
                      data-testid={`variable-${variable}`}
                    >
                      <code>{`{${variable}}`}</code>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contenido Principal */}
          <div className="lg:col-span-3 space-y-6">
            {/* Configuración del Mensaje Actual */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {tiposMenu.find(t => t.key === tipoMensaje)?.label}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={configuracion[tipoMensaje].activo}
                      onCheckedChange={(checked) => updateConfiguracion('activo', checked)}
                      data-testid={`checkbox-active-${tipoMensaje}`}
                    />
                    <Label className="text-sm">Activo</Label>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Título del mensaje */}
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título del mensaje</Label>
                  <Input
                    id="titulo"
                    value={configuracion[tipoMensaje].titulo}
                    onChange={(e) => updateConfiguracion('titulo', e.target.value)}
                    data-testid="input-message-title"
                  />
                </div>

                {/* Configuraciones específicas por tipo */}
                {tipoMensaje === 'pedidoListo' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={configuracion.pedidoListo.envioAutomatico}
                        onCheckedChange={(checked) => updateConfiguracion('envioAutomatico', checked)}
                        data-testid="checkbox-auto-send"
                      />
                      <Label className="text-sm">Envío automático</Label>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="horaEnvio">Hora de envío</Label>
                      <Input
                        id="horaEnvio"
                        type="time"
                        value={configuracion.pedidoListo.horaEnvio}
                        onChange={(e) => updateConfiguracion('horaEnvio', e.target.value)}
                        data-testid="input-send-time"
                      />
                    </div>
                  </div>
                )}

                {tipoMensaje === 'facturaWhatsApp' && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={configuracion.facturaWhatsApp.incluirDetalles}
                        onCheckedChange={(checked) => updateConfiguracion('incluirDetalles', checked)}
                        data-testid="checkbox-include-details"
                      />
                      <Label className="text-sm">Incluir detalles de artículos</Label>
                    </div>
                    {configuracion.facturaWhatsApp.incluirDetalles && (
                      <div className="space-y-2">
                        <Label htmlFor="formatoDetalles">Formato de detalles</Label>
                        <Input
                          id="formatoDetalles"
                          value={configuracion.facturaWhatsApp.formatoDetalles}
                          onChange={(e) => updateConfiguracion('formatoDetalles', e.target.value)}
                          placeholder="• {cantidad}x {prenda} - {servicio} - RD$ {precio}"
                          data-testid="input-details-format"
                        />
                      </div>
                    )}
                  </div>
                )}

                {tipoMensaje === 'recordatorios' && (
                  <div className="space-y-2">
                    <Label htmlFor="diasAntes">Días antes de la entrega</Label>
                    <Input
                      id="diasAntes"
                      type="number"
                      value={configuracion.recordatorios.diasAntes}
                      onChange={(e) => updateConfiguracion('diasAntes', parseInt(e.target.value) || 1)}
                      min="1"
                      max="7"
                      data-testid="input-days-before"
                    />
                  </div>
                )}

                {tipoMensaje === 'pagosPendientes' && (
                  <div className="space-y-2">
                    <Label htmlFor="diasRecordatorio">Días para recordatorio de pago</Label>
                    <Input
                      id="diasRecordatorio"
                      type="number"
                      value={configuracion.pagosPendientes.diasRecordatorio}
                      onChange={(e) => updateConfiguracion('diasRecordatorio', parseInt(e.target.value) || 3)}
                      min="1"
                      max="30"
                      data-testid="input-payment-reminder-days"
                    />
                  </div>
                )}

                {/* Plantillas Rápidas */}
                {plantillasMessages[tipoMensaje] && (
                  <div className="space-y-2">
                    <Label>Plantillas rápidas</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {Object.entries(plantillasMessages[tipoMensaje]).map(([tipo, plantilla]) => (
                        <Button
                          key={tipo}
                          variant="outline"
                          size="sm"
                          onClick={() => aplicarPlantilla(plantilla)}
                          className="capitalize"
                          data-testid={`template-${tipo}`}
                        >
                          {tipo}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Editor de Mensaje */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Mensaje</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={restaurarDefecto}
                      data-testid="button-restore-default"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Restaurar
                    </Button>
                  </div>
                  <Textarea
                    value={configuracion[tipoMensaje].mensaje}
                    onChange={(e) => updateConfiguracion('mensaje', e.target.value)}
                    rows={12}
                    className="font-mono text-sm"
                    placeholder="Escribe tu mensaje aquí..."
                    data-testid="textarea-message-content"
                  />
                  <p className="text-xs text-muted-foreground">
                    Usa variables como cliente_nombre, factura_numero, total_pagar para personalizar el mensaje
                  </p>
                </div>

                {/* Botones de Acción */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={mostrarVistaPrevia}
                    data-testid="button-preview-message"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Vista Previa
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal de Vista Previa */}
        <Dialog open={vistaPrevia} onOpenChange={setVistaPrevia}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Vista Previa del Mensaje</DialogTitle>
            </DialogHeader>

            {/* Selector de canal */}
            <div className="flex space-x-2 mb-4">
              <Button
                variant={canalPreview === 'whatsapp' ? "default" : "outline"}
                size="sm"
                onClick={() => setCanalPreview('whatsapp')}
                data-testid="preview-whatsapp"
              >
                <Smartphone className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
            </div>

            {/* Vista previa WhatsApp */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2 mb-3">
                <MessageCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">WhatsApp Preview</span>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <pre className="whitespace-pre-wrap text-sm text-foreground font-sans">
                  {mensajePreview}
                </pre>
                <div className="flex justify-end mt-2">
                  <span className="text-xs text-muted-foreground">
                    {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={copiarMensaje}
                data-testid="button-copy-message"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar
              </Button>
              <Button
                onClick={enviarPruebaWhatsApp}
                className="bg-green-600 hover:bg-green-700"
                data-testid="button-test-whatsapp"
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar Prueba
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}