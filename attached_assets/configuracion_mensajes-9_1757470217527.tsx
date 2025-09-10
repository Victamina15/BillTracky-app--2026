import React, { useState } from 'react';
import { ArrowLeft, Save, MessageCircle, Send, Eye, Copy, RotateCcw, Settings, FileText, Clock, CheckCircle, User, Phone, Calendar, DollarSign, Package } from 'lucide-react';

const ConfiguracionMensajes = () => {
  const [configuracion, setConfiguracion] = useState({
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

  const [tipoMensaje, setTipoMensaje] = useState('pedidoListo');
  const [vistaPrevia, setVistaPrevia] = useState(false);
  const [mensajePreview, setMensajePreview] = useState('');

  const variables = {
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
    empresa_nombre: "LavanderÍa Express",
    empresa_direccion: "Av. 27 de Febrero #123, Santo Domingo",
    empresa_telefono: "(809) 555-0123",
    empresa_horario: "Lun-Vie: 8:00 AM - 6:00 PM\nSáb: 8:00 AM - 2:00 PM",
    detalles_articulos: "• 2x Camisa - Lavado y Planchado - RD$ 120.00\n• 1x Pantalón - Lavado y Planchado - RD$ 80.00\n• 3x Camiseta - Solo Lavado - RD$ 150.00\n• 2x Vestido - Completo - RD$ 500.00"
  };

  const plantillasMessages = {
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

  const reemplazarVariables = (mensaje) => {
    let resultado = mensaje;
    Object.keys(variables).forEach(variable => {
      const regex = new RegExp(`{${variable}}`, 'g');
      resultado = resultado.replace(regex, variables[variable]);
    });
    return resultado;
  };

  const mostrarVistaPrevia = () => {
    const mensaje = configuracion[tipoMensaje].mensaje;
    setMensajePreview(reemplazarVariables(mensaje));
    setVistaPrevia(true);
  };

  const aplicarPlantilla = (plantilla) => {
    setConfiguracion({
      ...configuracion,
      [tipoMensaje]: {
        ...configuracion[tipoMensaje],
        mensaje: plantilla
      }
    });
  };

  const copiarMensaje = () => {
    navigator.clipboard.writeText(mensajePreview);
    alert('Mensaje copiado al portapapeles');
  };

  const enviarPruebaWhatsApp = () => {
    const numeroEjemplo = "18091234567";
    const mensaje = encodeURIComponent(mensajePreview);
    const url = `https://wa.me/${numeroEjemplo}?text=${mensaje}`;
    window.open(url, '_blank');
  };

  const restaurarDefecto = () => {
    if (confirm('¿Estás seguro de que quieres restaurar el mensaje por defecto?')) {
      // Aquí iría la lógica para restaurar los valores por defecto
      alert('Mensaje restaurado por defecto');
    }
  };

  const guardarConfiguracion = () => {
    console.log('Configuración guardada:', configuracion);
    alert('Configuración de mensajes guardada exitosamente');
  };

  const tiposMenu = [
    { key: 'pedidoListo', label: 'Pedido Listo', icon: CheckCircle, color: 'text-green-600' },
    { key: 'facturaWhatsApp', label: 'Factura WhatsApp', icon: FileText, color: 'text-blue-600' },
    { key: 'recordatorios', label: 'Recordatorios', icon: Clock, color: 'text-orange-600' },
    { key: 'pagosPendientes', label: 'Pagos Pendientes', icon: DollarSign, color: 'text-red-600' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Configuración de Mensajes</h1>
                <p className="text-sm text-gray-600">WhatsApp y notificaciones automáticas</p>
              </div>
            </div>
            <button
              onClick={guardarConfiguracion}
              className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700"
            >
              <Save className="w-5 h-5" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Menu Lateral */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipos de Mensaje</h3>
            <div className="space-y-2">
              {tiposMenu.map((tipo) => {
                const IconoTipo = tipo.icon;
                return (
                  <button
                    key={tipo.key}
                    onClick={() => setTipoMensaje(tipo.key)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      tipoMensaje === tipo.key
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <IconoTipo className={`w-5 h-5 ${tipo.color}`} />
                    <span className="text-sm font-medium">{tipo.label}</span>
                    {configuracion[tipo.key].activo && (
                      <div className="w-2 h-2 bg-green-500 rounded-full ml-auto"></div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Variables Disponibles */}
            <div className="mt-8">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Variables Disponibles</h4>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {Object.keys(variables).map((variable) => (
                  <div
                    key={variable}
                    className="text-xs bg-gray-100 px-2 py-1 rounded cursor-pointer hover:bg-gray-200"
                    onClick={() => {
                      navigator.clipboard.writeText(`{${variable}}`);
                      alert(`Variable {${variable}} copiada`);
                    }}
                  >
                    <code>{`{${variable}}`}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contenido Principal */}
          <div className="lg:col-span-3 space-y-6">
            {/* Configuración del Mensaje Actual */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {tiposMenu.find(t => t.key === tipoMensaje)?.label}
                </h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="activo"
                    checked={configuracion[tipoMensaje].activo}
                    onChange={(e) => setConfiguracion({
                      ...configuracion,
                      [tipoMensaje]: {
                        ...configuracion[tipoMensaje],
                        activo: e.target.checked
                      }
                    })}
                    className="rounded"
                  />
                  <label htmlFor="activo" className="text-sm text-gray-700">Activo</label>
                </div>
              </div>

              {/* Configuraciones específicas */}
              <div className="space-y-4 mb-6">
                {/* Título del mensaje */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título del mensaje
                  </label>
                  <input
                    type="text"
                    value={configuracion[tipoMensaje].titulo}
                    onChange={(e) => setConfiguracion({
                      ...configuracion,
                      [tipoMensaje]: {
                        ...configuracion[tipoMensaje],
                        titulo: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Configuraciones específicas por tipo */}
                {tipoMensaje === 'pedidoListo' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="envioAutomatico"
                        checked={configuracion.pedidoListo.envioAutomatico}
                        onChange={(e) => setConfiguracion({
                          ...configuracion,
                          pedidoListo: {
                            ...configuracion.pedidoListo,
                            envioAutomatico: e.target.checked
                          }
                        })}
                        className="rounded"
                      />
                      <label htmlFor="envioAutomatico" className="text-sm text-gray-700">
                        Envío automático
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hora de envío
                      </label>
                      <input
                        type="time"
                        value={configuracion.pedidoListo.horaEnvio}
                        onChange={(e) => setConfiguracion({
                          ...configuracion,
                          pedidoListo: {
                            ...configuracion.pedidoListo,
                            horaEnvio: e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                {tipoMensaje === 'facturaWhatsApp' && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="incluirDetalles"
                        checked={configuracion.facturaWhatsApp.incluirDetalles}
                        onChange={(e) => setConfiguracion({
                          ...configuracion,
                          facturaWhatsApp: {
                            ...configuracion.facturaWhatsApp,
                            incluirDetalles: e.target.checked
                          }
                        })}
                        className="rounded"
                      />
                      <label htmlFor="incluirDetalles" className="text-sm text-gray-700">
                        Incluir detalles de artículos
                      </label>
                    </div>
                    {configuracion.facturaWhatsApp.incluirDetalles && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Formato de detalles
                        </label>
                        <input
                          type="text"
                          value={configuracion.facturaWhatsApp.formatoDetalles}
                          onChange={(e) => setConfiguracion({
                            ...configuracion,
                            facturaWhatsApp: {
                              ...configuracion.facturaWhatsApp,
                              formatoDetalles: e.target.value
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="• {cantidad}x {prenda} - {servicio} - RD$ {precio}"
                        />
                      </div>
                    )}
                  </div>
                )}

                {tipoMensaje === 'recordatorios' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Días antes de la entrega
                    </label>
                    <input
                      type="number"
                      value={configuracion.recordatorios.diasAntes}
                      onChange={(e) => setConfiguracion({
                        ...configuracion,
                        recordatorios: {
                          ...configuracion.recordatorios,
                          diasAntes: parseInt(e.target.value) || 1
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                      max="7"
                    />
                  </div>
                )}

                {tipoMensaje === 'pagosPendientes' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Días para recordatorio de pago
                    </label>
                    <input
                      type="number"
                      value={configuracion.pagosPendientes.diasRecordatorio}
                      onChange={(e) => setConfiguracion({
                        ...configuracion,
                        pagosPendientes: {
                          ...configuracion.pagosPendientes,
                          diasRecordatorio: parseInt(e.target.value) || 3
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                      max="30"
                    />
                  </div>
                )}
              </div>

              {/* Plantillas Rápidas */}
              {plantillasMessages[tipoMensaje] && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plantillas rápidas
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {Object.entries(plantillasMessages[tipoMensaje]).map(([tipo, plantilla]) => (
                      <button
                        key={tipo}
                        onClick={() => aplicarPlantilla(plantilla)}
                        className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 capitalize"
                      >
                        {tipo}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Editor de Mensaje */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Mensaje
                  </label>
                  <div className="flex space-x-2">
                    <button
                      onClick={restaurarDefecto}
                      className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Restaurar</span>
                    </button>
                  </div>
                </div>
                <textarea
                  value={configuracion[tipoMensaje].mensaje}
                  onChange={(e) => setConfiguracion({
                    ...configuracion,
                    [tipoMensaje]: {
                      ...configuracion[tipoMensaje],
                      mensaje: e.target.value
                    }
                  })}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="Escribe tu mensaje aquí..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Usa variables como {`{cliente_nombre}, {factura_numero}, {total_pagar}`} para personalizar el mensaje
                </p>
              </div>

              {/* Botones de Acción */}
              <div className="flex flex-wrap gap-3 mt-6">
                <button
                  onClick={mostrarVistaPrevia}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
                >
                  <Eye className="w-4 h-4" />
                  <span>Vista Previa</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Vista Previa */}
      {vistaPrevia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Vista Previa del Mensaje</h3>
                <button
                  onClick={() => setVistaPrevia(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Simulación de WhatsApp */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2 mb-3">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">WhatsApp Preview</span>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <pre className="whitespace-pre-wrap text-sm text-gray-900 font-sans">
                    {mensajePreview}
                  </pre>
                  <div className="flex justify-end mt-2">
                    <span className="text-xs text-gray-500">
                      {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={copiarMensaje}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copiar</span>
                </button>
                <button
                  onClick={enviarPruebaWhatsApp}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Prueba</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfiguracionMensajes;