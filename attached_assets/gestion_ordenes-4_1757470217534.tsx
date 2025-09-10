import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  DollarSign, 
  Send, 
  Printer, 
  X, 
  Check, 
  Clock, 
  Package, 
  AlertCircle,
  Phone,
  Mail,
  Calendar,
  User,
  CreditCard,
  Banknote,
  Landmark,
  RefreshCw,
  CheckCircle,
  XCircle,
  PlayCircle
} from 'lucide-react';

const GestionOrdenes = () => {
  // Estados principales
  const [orders, setOrders] = useState([
    {
      id: 'INV-009',
      numero: 'FAC-009',
      cliente: 'Juan Pérez',
      telefono: '8091502025',
      correo: 'juan@email.com',
      total: 378.00,
      subtotal: 320.34,
      itbis: 57.66,
      estado: 'Recibido',
      fechaRecibido: '2025-09-04',
      fechaRetiro: '2025-09-06',
      horaRecibido: '16:53',
      metodoPago: 'Pendiente',
      empleado: 'Sistema',
      pagado: false,
      entregado: false,
      articulos: [
        { nombre: 'CAMISAS', servicio: 'lavadoYPlanchado', cantidad: 2, precio: 85 },
        { nombre: 'PANTALONES', servicio: 'lavado', cantidad: 1, precio: 80 }
      ]
    },
    {
      id: 'INV-008',
      numero: 'FAC-008',
      cliente: 'María García',
      telefono: '8095551234',
      correo: 'maria@email.com',
      total: 378.00,
      subtotal: 320.34,
      itbis: 57.66,
      estado: 'En Proceso',
      fechaRecibido: '2025-09-03',
      fechaRetiro: '2025-09-05',
      horaRecibido: '19:21',
      metodoPago: 'Efectivo',
      empleado: 'María Fernández',
      pagado: true,
      entregado: false,
      articulos: [
        { nombre: 'VESTIDOS', servicio: 'lavadoYPlanchado', cantidad: 1, precio: 220 },
        { nombre: 'BLUSAS', servicio: 'planchado', cantidad: 2, precio: 40 }
      ]
    },
    {
      id: 'INV-007',
      numero: 'FAC-007',
      cliente: 'Pedro López',
      telefono: '8097779999',
      correo: '',
      total: 290.00,
      subtotal: 245.76,
      itbis: 44.24,
      estado: 'Listo',
      fechaRecibido: '2025-09-02',
      fechaRetiro: '2025-09-04',
      horaRecibido: '17:38',
      metodoPago: 'Tarjeta',
      empleado: 'Juan Carlos',
      pagado: true,
      entregado: false,
      articulos: [
        { nombre: 'SÁBANAS', servicio: 'lavadoYPlanchado', cantidad: 1, precio: 150 },
        { nombre: 'TOALLAS (GRANDE)', servicio: 'lavado', cantidad: 3, precio: 40 }
      ]
    },
    {
      id: 'INV-006',
      numero: 'FAC-006',
      cliente: 'Ana Rodríguez',
      telefono: '8094445555',
      correo: 'ana@email.com',
      total: 195.50,
      subtotal: 165.68,
      itbis: 29.82,
      estado: 'Entregado',
      fechaRecibido: '2025-09-01',
      fechaRetiro: '2025-09-03',
      horaRecibido: '14:30',
      metodoPago: 'Transferencia Bancaria',
      empleado: 'Pedro González',
      pagado: true,
      entregado: true,
      fechaEntrega: '2025-09-03',
      horaEntrega: '16:45',
      articulos: [
        { nombre: 'PANTALONES', servicio: 'lavadoYPlanchado', cantidad: 1, precio: 110 },
        { nombre: 'CAMISAS', servicio: 'planchado', cantidad: 2, precio: 40 }
      ]
    },
    {
      id: 'INV-005',
      numero: 'FAC-005',
      cliente: 'Carlos Mendoza',
      telefono: '8096667777',
      correo: '',
      total: 85.00,
      subtotal: 72.03,
      itbis: 12.97,
      estado: 'Cancelado',
      fechaRecibido: '2025-08-31',
      fechaRetiro: '2025-09-02',
      horaRecibido: '11:15',
      metodoPago: 'Efectivo',
      empleado: 'María Fernández',
      pagado: false,
      entregado: false,
      fechaCancelacion: '2025-09-01',
      motivoCancelacion: 'Cliente no recogió a tiempo',
      articulos: [
        { nombre: 'CAMISAS', servicio: 'lavado', cantidad: 1, precio: 60 }
      ]
    }
  ]);

  // Estados de modales y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Configuración de estados y métodos de pago
  const estados = [
    { id: 'Recibido', nombre: 'Recibido', color: 'blue', icon: Package },
    { id: 'En Proceso', nombre: 'En Proceso', color: 'yellow', icon: RefreshCw },
    { id: 'Listo', nombre: 'Listo', color: 'purple', icon: CheckCircle },
    { id: 'Entregado', nombre: 'Entregado', color: 'green', icon: Check },
    { id: 'Cancelado', nombre: 'Cancelado', color: 'red', icon: XCircle }
  ];

  const metodosPago = [
    { id: 'Efectivo', nombre: 'Efectivo', icon: Banknote, color: 'green' },
    { id: 'Tarjeta', nombre: 'Tarjeta', icon: CreditCard, color: 'blue' },
    { id: 'Transferencia Bancaria', nombre: 'Transferencia Bancaria', icon: Landmark, color: 'indigo' },
    { id: 'Pendiente', nombre: 'Pendiente', icon: Clock, color: 'yellow' }
  ];

  // Empleado logueado simulado
  const empleadoLogueado = {
    nombre: 'Juan Carlos',
    rol: 'gerente'
  };

  // Funciones utilitarias
  const formatCurrency = (amount) => `RD$${amount.toFixed(2)}`;

  const openModal = (message) => {
    setModalMessage(message);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalMessage('');
  };

  const getStatusColor = (estado) => {
    const statusConfig = estados.find(s => s.id === estado);
    return statusConfig ? statusConfig.color : 'gray';
  };

  const getPaymentColor = (metodoPago) => {
    const paymentConfig = metodosPago.find(m => m.id === metodoPago);
    return paymentConfig ? paymentConfig.color : 'gray';
  };

  // Funciones de filtrado
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.telefono.includes(searchTerm);
    
    const matchesStatus = filterStatus === 'all' || order.estado === filterStatus;
    const matchesPayment = filterPayment === 'all' || 
                          (filterPayment === 'paid' && order.pagado) ||
                          (filterPayment === 'pending' && !order.pagado);
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Funciones de acciones
  const verDetalles = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const cambiarEstado = (order, nuevoEstado) => {
    if (nuevoEstado === 'Entregado' && !order.pagado) {
      openModal("No se puede entregar sin cobrar. Cobre primero el pedido.");
      return;
    }

    const ordenesActualizadas = orders.map(o => 
      o.id === order.id 
        ? { 
            ...o, 
            estado: nuevoEstado,
            ...(nuevoEstado === 'Entregado' && {
              entregado: true,
              fechaEntrega: new Date().toISOString().split('T')[0],
              horaEntrega: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
            })
          }
        : o
    );
    
    setOrders(ordenesActualizadas);
    setShowStatusModal(false);
    openModal(`Estado cambiado a "${nuevoEstado}" exitosamente.`);
  };

  const cobrarPago = (order, metodoPago) => {
    const ordenesActualizadas = orders.map(o => 
      o.id === order.id 
        ? { ...o, pagado: true, metodoPago: metodoPago }
        : o
    );
    
    setOrders(ordenesActualizadas);
    setShowPaymentModal(false);
    openModal(`Pago cobrado: ${metodoPago}`);
  };

  const cancelarOrden = () => {
    if (!cancelReason.trim()) {
      openModal("Debe proporcionar un motivo de cancelación.");
      return;
    }

    if (empleadoLogueado.rol !== 'gerente') {
      openModal("Solo los gerentes pueden cancelar órdenes.");
      return;
    }

    const ordenesActualizadas = orders.map(o => 
      o.id === selectedOrder.id 
        ? { 
            ...o, 
            estado: 'Cancelado',
            fechaCancelacion: new Date().toISOString().split('T')[0],
            motivoCancelacion: cancelReason,
            canceladoPor: empleadoLogueado.nombre
          }
        : o
    );
    
    setOrders(ordenesActualizadas);
    setShowCancelModal(false);
    setCancelReason('');
    openModal(`Orden ${selectedOrder.numero} cancelada exitosamente.`);
  };

  const enviarWhatsApp = (order) => {
    const mensaje = `¡Hola ${order.cliente}! Su pedido ${order.numero} está ${order.estado.toLowerCase()}. Total: ${formatCurrency(order.total)}. ¡Gracias por confiar en nosotros!`;
    const url = `https://wa.me/${order.telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  const imprimirRecibo = (order) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Recibo - ${order.numero}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 400px; margin: 0; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
            .section { margin: 15px 0; }
            .item { display: flex; justify-content: space-between; margin: 5px 0; }
            .total { font-weight: bold; font-size: 1.1em; border-top: 2px solid #000; padding-top: 10px; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>BILLTRACKY</h2>
            <h3>RECIBO DE LAVANDERÍA</h3>
            <p>Factura: ${order.numero}</p>
          </div>
          
          <div class="section">
            <h4>DATOS DEL CLIENTE</h4>
            <div class="item"><span>Cliente:</span><span>${order.cliente}</span></div>
            <div class="item"><span>Teléfono:</span><span>${order.telefono}</span></div>
            <div class="item"><span>Recibido:</span><span>${order.fechaRecibido} ${order.horaRecibido}</span></div>
            <div class="item"><span>Entrega:</span><span>${order.fechaRetiro}</span></div>
          </div>
          
          <div class="section">
            <h4>ARTÍCULOS</h4>
            ${order.articulos.map(art => 
              `<div class="item"><span>${art.cantidad}x ${art.nombre} (${art.servicio})</span><span>${formatCurrency(art.cantidad * art.precio)}</span></div>`
            ).join('')}
          </div>
          
          <div class="section">
            <div class="item"><span>Subtotal:</span><span>${formatCurrency(order.subtotal)}</span></div>
            <div class="item"><span>ITBIS (18%):</span><span>${formatCurrency(order.itbis)}</span></div>
            <div class="total">
              <div class="item"><span>TOTAL:</span><span>${formatCurrency(order.total)}</span></div>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; font-size: 0.9em;">
            <p>Estado: ${order.estado}</p>
            <p>Método de Pago: ${order.metodoPago}</p>
            <p>Atendido por: ${order.empleado}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Componente Modal principal
  const Modal = () => {
    if (!isModalOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestión de Órdenes</h3>
            <p className="text-gray-600 mb-6">{modalMessage}</p>
            <button
              onClick={closeModal}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Modal de detalles de orden
  const DetailsModal = () => {
    if (!showDetailsModal || !selectedOrder) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-96 overflow-y-auto p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Detalles de Orden</h3>
            <button
              onClick={() => setShowDetailsModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Información General</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Factura:</span>
                    <span className="font-medium">{selectedOrder.numero}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cliente:</span>
                    <span className="font-medium">{selectedOrder.cliente}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Teléfono:</span>
                    <span className="font-medium">{selectedOrder.telefono}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Empleado:</span>
                    <span className="font-medium">{selectedOrder.empleado}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Fechas</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Recibido:</span>
                    <span className="font-medium">{selectedOrder.fechaRecibido} {selectedOrder.horaRecibido}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Entrega:</span>
                    <span className="font-medium">{selectedOrder.fechaRetiro}</span>
                  </div>
                  {selectedOrder.entregado && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Entregado:</span>
                      <span className="font-medium text-green-600">{selectedOrder.fechaEntrega} {selectedOrder.horaEntrega}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Estado y Pago</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Estado:</span>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full bg-${getStatusColor(selectedOrder.estado)}-100 text-${getStatusColor(selectedOrder.estado)}-800`}>
                      {selectedOrder.estado}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Pago:</span>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full bg-${getPaymentColor(selectedOrder.metodoPago)}-100 text-${getPaymentColor(selectedOrder.metodoPago)}-800`}>
                      {selectedOrder.metodoPago}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pagado:</span>
                    <span className={`font-medium ${selectedOrder.pagado ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedOrder.pagado ? 'Sí' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Totales</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ITBIS:</span>
                    <span className="font-medium">{formatCurrency(selectedOrder.itbis)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-blue-600">{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="font-semibold text-gray-900 mb-3">Artículos</h4>
            <div className="space-y-2">
              {selectedOrder.articulos.map((articulo, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium">{articulo.cantidad}x {articulo.nombre}</span>
                    <span className="text-sm text-gray-600 ml-2">({articulo.servicio})</span>
                  </div>
                  <span className="font-medium">{formatCurrency(articulo.cantidad * articulo.precio)}</span>
                </div>
              ))}
            </div>
          </div>

          {selectedOrder.estado === 'Cancelado' && selectedOrder.motivoCancelacion && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-semibold text-red-900 mb-2">Motivo de Cancelación</h4>
              <p className="text-sm text-red-700">{selectedOrder.motivoCancelacion}</p>
              <p className="text-xs text-red-600 mt-1">Cancelado el {selectedOrder.fechaCancelacion}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Modal de cambio de estado
  const StatusModal = () => {
    if (!showStatusModal || !selectedOrder) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Cambiar Estado</h3>
            <button
              onClick={() => setShowStatusModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-3">
            {estados.filter(estado => estado.id !== 'Cancelado').map((estado) => {
              const IconComponent = estado.icon;
              return (
                <button
                  key={estado.id}
                  onClick={() => cambiarEstado(selectedOrder, estado.id)}
                  disabled={selectedOrder.estado === estado.id}
                  className={`w-full p-4 rounded-lg border-2 transition-all duration-200 flex items-center space-x-3 ${
                    selectedOrder.estado === estado.id
                      ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
                      : `border-gray-200 hover:border-${estado.color}-500 hover:bg-${estado.color}-50`
                  }`}
                >
                  <IconComponent className={`w-6 h-6 text-${estado.color}-600`} />
                  <span className="font-medium text-gray-900">{estado.nombre}</span>
                  {selectedOrder.estado === estado.id && (
                    <span className="ml-auto text-xs text-gray-500">Actual</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Modal de cobro
  const PaymentModal = () => {
    if (!showPaymentModal || !selectedOrder) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Cobrar Pago</h3>
            <button
              onClick={() => setShowPaymentModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="text-center mb-6">
            <p className="text-gray-600">Total a cobrar:</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(selectedOrder.total)}</p>
          </div>
          
          <div className="space-y-3">
            {metodosPago.filter(metodo => metodo.id !== 'Pendiente').map((metodo) => {
              const IconComponent = metodo.icon;
              return (
                <button
                  key={metodo.id}
                  onClick={() => cobrarPago(selectedOrder, metodo.nombre)}
                  className={`w-full p-4 rounded-lg border-2 border-gray-200 hover:border-${metodo.color}-500 hover:bg-${metodo.color}-50 transition-all duration-200 flex items-center space-x-3`}
                >
                  <IconComponent className={`w-6 h-6 text-${metodo.color}-600`} />
                  <span className="font-medium text-gray-900">{metodo.nombre}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Modal de cancelación
  const CancelModal = () => {
    if (!showCancelModal || !selectedOrder) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Cancelar Orden</h3>
            <button
              onClick={() => setShowCancelModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-gray-600">
              ¿Está seguro que desea cancelar la orden <strong>{selectedOrder.numero}</strong>?
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Motivo de cancelación *</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                rows={3}
                placeholder="Ej: Cliente no recogió a tiempo, problema con la prenda, etc."
              />
            </div>
          </div>
          
          <div className="flex space-x-3 mt-6">
            <button
              onClick={() => setShowCancelModal(false)}
              className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={cancelarOrden}
              className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              Confirmar Cancelación
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Órdenes</h1>
                <p className="text-gray-600">Lista, búsqueda, estados y acciones</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-500">Total órdenes</p>
              <p className="text-2xl font-bold text-blue-600">{filteredOrders.length}</p>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por factura, cliente o teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los estados</option>
                {estados.map((estado) => (
                  <option key={estado.id} value={estado.id}>{estado.nombre}</option>
                ))}
              </select>
            </div>
            
            <div>
              <select
                value={filterPayment}
                onChange={(e) => setFilterPayment(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los pagos</option>
                <option value="paid">Pagados</option>
                <option value="pending">Pendientes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de órdenes */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Factura</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recibido</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entrega</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Pago</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className={`hover:bg-gray-50 ${order.estado === 'Cancelado' ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div>
                        <p className="font-semibold">{order.numero}</p>
                        <p className="text-xs text-gray-500">#{order.id}</p>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-sm">
                      <div>
                        <p className="font-medium">{order.cliente}</p>
                        <p className="text-xs text-gray-500">{order.telefono}</p>
                        {order.correo && (
                          <p className="text-xs text-gray-500">{order.correo}</p>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-sm">
                      <div>
                        <p>{new Date(order.fechaRecibido).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-500">{order.horaRecibido}</p>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-sm">
                      <div>
                        <p>{new Date(order.fechaRetiro).toLocaleDateString()}</p>
                        {order.entregado && order.horaEntrega && (
                          <p className="text-xs text-green-600">
                            Entregado: {order.horaEntrega}
                          </p>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => {
                          if (order.estado === 'Cancelado') return;
                          setSelectedOrder(order);
                          setShowStatusModal(true);
                        }}
                        disabled={order.estado === 'Cancelado'}
                        className={`px-3 py-1 text-xs font-medium rounded-full cursor-pointer hover:opacity-80 transition-opacity ${
                          order.estado === 'Cancelado' ? 'cursor-not-allowed' : ''
                        } bg-${getStatusColor(order.estado)}-100 text-${getStatusColor(order.estado)}-800`}
                      >
                        {order.estado}
                      </button>
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full bg-${getPaymentColor(order.metodoPago)}-100 text-${getPaymentColor(order.metodoPago)}-800`}>
                        {order.metodoPago}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 text-sm font-medium">
                      {formatCurrency(order.total)}
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {!order.pagado && order.estado !== 'Cancelado' && (
                          <button 
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowPaymentModal(true);
                            }}
                            className="text-green-600 hover:text-green-900"
                            title="Cobrar"
                          >
                            <DollarSign className="w-4 h-4" />
                          </button>
                        )}
                        
                        {order.estado !== 'Cancelado' && (
                          <>
                            <button 
                              onClick={() => enviarWhatsApp(order)}
                              className="text-green-600 hover:text-green-900"
                              title="WhatsApp"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                            
                            <button 
                              onClick={() => imprimirRecibo(order)}
                              className="text-blue-600 hover:text-blue-900" 
                              title="Imprimir"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        
                        <button 
                          onClick={() => verDetalles(order)}
                          className="text-cyan-600 hover:text-cyan-900" 
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {empleadoLogueado.rol === 'gerente' && order.estado !== 'Cancelado' && order.estado !== 'Entregado' && (
                          <button 
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowCancelModal(true);
                            }}
                            className="text-red-600 hover:text-red-900" 
                            title="Cancelar orden (Solo Gerente)"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredOrders.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p>No se encontraron órdenes con los filtros aplicados</p>
            </div>
          )}
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          {estados.map((estado) => {
            const count = orders.filter(o => o.estado === estado.id).length;
            const IconComponent = estado.icon;
            
            return (
              <div key={estado.id} className="bg-white rounded-xl shadow-sm border p-4">
                <div className="flex items-center">
                  <div className={`w-10 h-10 bg-${estado.color}-100 rounded-lg flex items-center justify-center`}>
                    <IconComponent className={`w-5 h-5 text-${estado.color}-600`} />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-500">{estado.nombre}</p>
                    <p className="text-lg font-bold text-gray-900">{count}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modales */}
      <Modal />
      <DetailsModal />
      <StatusModal />
      <PaymentModal />
      <CancelModal />
    </div>
  );
};

export default GestionOrdenes;
            