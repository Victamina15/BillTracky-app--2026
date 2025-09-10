import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Save, 
  DollarSign, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  Package, 
  Search,
  X,
  Clock,
  Check,
  Users,
  CreditCard,
  Banknote,
  Landmark
} from 'lucide-react';

const NuevaFactura = () => {
  const [facturaActual, setFacturaActual] = useState({
    numero: 'FAC-010',
    fecha: new Date().toISOString().split('T')[0],
    cliente: '',
    telefono: '',
    correo: '',
    diaEntrega: '',
    articulos: [],
    subtotal: 0,
    itbis: 0,
    total: 0,
    metodoPago: 'Efectivo'
  });

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDateTimeSelector, setShowDateTimeSelector] = useState(false);
  const [showClientesPanel, setShowClientesPanel] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filtroCliente, setFiltroCliente] = useState('');
  const [clienteSugerido, setClienteSugerido] = useState(null);
  const [selectedDateTime, setSelectedDateTime] = useState({
    fecha: '',
    hora: '12:00'
  });

  const clientesFrecuentes = [
    { id: 1, nombre: 'Juan Pérez', telefono: '8091502025', correo: 'juan@email.com', totalCompras: 5 },
    { id: 2, nombre: 'María García', telefono: '8097779999', correo: 'maria@email.com', totalCompras: 3 },
    { id: 3, nombre: 'Pedro López', telefono: '8095551234', correo: '', totalCompras: 8 }
  ];

  const preciosServicios = [
    { id: 1, nombre: 'PANTALONES', precios: { lavado: 80, planchado: 60, lavadoYPlanchado: 110 } },
    { id: 2, nombre: 'CAMISAS', precios: { lavado: 60, planchado: 40, lavadoYPlanchado: 85 } },
    { id: 3, nombre: 'VESTIDOS', precios: { lavado: 150, planchado: 120, lavadoYPlanchado: 220 } },
    { id: 4, nombre: 'BLUSAS', precios: { lavado: 60, planchado: 40, lavadoYPlanchado: 85 } },
    { id: 5, nombre: 'SÁBANAS', precios: { lavado: 100, planchado: 80, lavadoYPlanchado: 150 } },
    { id: 6, nombre: 'TOALLAS (GRANDE)', precios: { lavado: 40, planchado: 30, lavadoYPlanchado: 60 } }
  ];

  const metodosPago = [
    { id: 'efectivo', nombre: 'Efectivo', icon: Banknote },
    { id: 'tarjeta', nombre: 'Tarjeta', icon: CreditCard },
    { id: 'transferencia', nombre: 'Transferencia Bancaria', icon: Landmark },
    { id: 'pendiente', nombre: 'Pago Pendiente', icon: Clock }
  ];

  const formatCurrency = (amount) => `RD$${amount.toFixed(2)}`;

  const openModal = (message) => {
    setModalMessage(message);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalMessage('');
  };

  const calcularTotales = (articulos) => {
    const subtotal = articulos.reduce((acc, item) => acc + (item.cantidad * item.precio), 0);
    const itbis = subtotal * 0.18;
    const total = subtotal + itbis;
    return { subtotal, itbis, total };
  };

  const manejarCambioTelefono = (valor) => {
    setFacturaActual({ ...facturaActual, telefono: valor });
    
    if (valor.length >= 4) {
      const clienteEncontrado = clientesFrecuentes.find(cliente => 
        cliente.telefono.includes(valor) || cliente.telefono.replace(/\D/g, '').includes(valor)
      );
      
      if (clienteEncontrado) {
        setClienteSugerido(clienteEncontrado);
      } else {
        setClienteSugerido(null);
      }
    }
  };

  const seleccionarClienteSugerido = (cliente) => {
    setFacturaActual({ 
      ...facturaActual, 
      cliente: cliente.nombre,
      telefono: cliente.telefono,
      correo: cliente.correo || ''
    });
    setClienteSugerido(null);
  };

  const seleccionarClienteDelPanel = (cliente) => {
    setFacturaActual({ 
      ...facturaActual, 
      cliente: cliente.nombre,
      telefono: cliente.telefono,
      correo: cliente.correo || ''
    });
    setShowClientesPanel(false);
  };

  const agregarArticulo = () => {
    const primerPrenda = preciosServicios[0];
    const nuevoArticulo = {
      id: Date.now(),
      nombre: primerPrenda.nombre,
      servicio: 'lavado',
      cantidad: 1,
      precio: primerPrenda.precios.lavado
    };
    const nuevosArticulos = [...facturaActual.articulos, nuevoArticulo];
    const { subtotal, itbis, total } = calcularTotales(nuevosArticulos);
    setFacturaActual({ ...facturaActual, articulos: nuevosArticulos, subtotal, itbis, total });
  };

  const eliminarArticulo = (id) => {
    const nuevosArticulos = facturaActual.articulos.filter(item => item.id !== id);
    const { subtotal, itbis, total } = calcularTotales(nuevosArticulos);
    setFacturaActual({ ...facturaActual, articulos: nuevosArticulos, subtotal, itbis, total });
  };

  const manejarCambioArticulo = (id, campo, valor) => {
    const nuevosArticulos = facturaActual.articulos.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [campo]: valor };
        const prenda = preciosServicios.find(p => p.nombre === updatedItem.nombre);
        if (prenda && (campo === 'nombre' || campo === 'servicio')) {
          updatedItem.precio = prenda.precios[updatedItem.servicio] || 0;
        }
        return updatedItem;
      }
      return item;
    });
    const { subtotal, itbis, total } = calcularTotales(nuevosArticulos);
    setFacturaActual({ ...facturaActual, articulos: nuevosArticulos, subtotal, itbis, total });
  };

  const abrirSelectorFechaHora = () => {
    setSelectedDateTime({
      fecha: facturaActual.diaEntrega || new Date().toISOString().split('T')[0],
      hora: '12:00'
    });
    setShowDateTimeSelector(true);
  };

  const confirmarFechaHora = () => {
    setFacturaActual({
      ...facturaActual,
      diaEntrega: selectedDateTime.fecha
    });
    setShowDateTimeSelector(false);
  };

  const ajustarFecha = (dias) => {
    const nuevaFecha = new Date(selectedDateTime.fecha);
    nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    setSelectedDateTime({
      ...selectedDateTime,
      fecha: nuevaFecha.toISOString().split('T')[0]
    });
  };

  const guardarFactura = (esPendiente = false) => {
    if (!facturaActual.cliente || !facturaActual.telefono) {
      openModal("Complete los datos del cliente.");
      return;
    }

    if (facturaActual.articulos.length === 0) {
      openModal("Agregue al menos un artículo.");
      return;
    }

    if (!facturaActual.diaEntrega) {
      openModal("Seleccione la fecha de entrega.");
      return;
    }

    const metodoPago = esPendiente ? 'Pendiente' : facturaActual.metodoPago;
    
    openModal(`Factura ${facturaActual.numero} guardada exitosamente. Método de pago: ${metodoPago}`);
    
    setFacturaActual({
      numero: `FAC-${String(parseInt(facturaActual.numero.split('-')[1]) + 1).padStart(3, '0')}`,
      fecha: new Date().toISOString().split('T')[0],
      cliente: '',
      telefono: '',
      correo: '',
      diaEntrega: '',
      articulos: [],
      subtotal: 0,
      itbis: 0,
      total: 0,
      metodoPago: 'Efectivo'
    });
    
    setShowPaymentModal(false);
  };

  const Modal = () => {
    if (!isModalOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Billtracky</h3>
            <p className="text-gray-600 mb-6">{modalMessage}</p>
            <button
              onClick={closeModal}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium transition-colors"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    );
  };

  const PaymentMethodModal = () => {
    if (!showPaymentModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Método de Pago</h3>
            <p className="text-gray-600 mt-2">Total: {formatCurrency(facturaActual.total)}</p>
          </div>
          
          <div className="space-y-3 mb-6">
            {metodosPago.map((metodo) => {
              const IconComponent = metodo.icon;
              return (
                <button
                  key={metodo.id}
                  onClick={() => {
                    setFacturaActual({ ...facturaActual, metodoPago: metodo.nombre });
                    guardarFactura(false);
                  }}
                  className="w-full p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 flex items-center space-x-3"
                >
                  <IconComponent className="w-6 h-6 text-blue-600" />
                  <span className="font-medium text-gray-900">{metodo.nombre}</span>
                </button>
              );
            })}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={() => guardarFactura(true)}
              className="flex-1 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium"
            >
              Pago Pendiente
            </button>
          </div>
        </div>
      </div>
    );
  };

  const DateTimeSelector = () => {
    if (!showDateTimeSelector) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
          <div className="text-center mb-6">
            <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">Fecha de Entrega</h3>
          </div>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
              <input
                type="date"
                value={selectedDateTime.fecha}
                onChange={(e) => setSelectedDateTime({...selectedDateTime, fecha: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => ajustarFecha(-1)}
                className="flex-1 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
              >
                -1 día
              </button>
              <button
                onClick={() => ajustarFecha(1)}
                className="flex-1 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
              >
                +1 día
              </button>
              <button
                onClick={() => ajustarFecha(2)}
                className="flex-1 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
              >
                +2 días
              </button>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setShowDateTimeSelector(false)}
              className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={confirmarFechaHora}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ClientesPanel = () => {
    if (!showClientesPanel) return null;
    
    const clientesFiltrados = clientesFrecuentes.filter(cliente =>
      cliente.nombre.toLowerCase().includes(filtroCliente.toLowerCase()) ||
      cliente.telefono.includes(filtroCliente)
    );
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full max-h-96 shadow-2xl">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Clientes Frecuentes</h3>
              <button
                onClick={() => setShowClientesPanel(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={filtroCliente}
                onChange={(e) => setFiltroCliente(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          
          <div className="max-h-64 overflow-y-auto p-4">
            {clientesFiltrados.map((cliente) => (
              <button
                key={cliente.id}
                onClick={() => seleccionarClienteDelPanel(cliente)}
                className="w-full p-3 text-left hover:bg-gray-50 rounded-lg mb-2 border border-gray-200"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{cliente.nombre}</p>
                    <p className="text-sm text-gray-600">{cliente.telefono}</p>
                    {cliente.correo && (
                      <p className="text-xs text-gray-500">{cliente.correo}</p>
                    )}
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {cliente.totalCompras} compras
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Nueva Factura</h1>
                <p className="text-gray-600">Factura #{facturaActual.numero}</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-500">Fecha</p>
              <p className="font-medium">{new Date(facturaActual.fecha).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Información del Cliente */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Información del Cliente
            </h2>
            <button
              onClick={() => setShowClientesPanel(true)}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium flex items-center space-x-2"
            >
              <Users className="w-4 h-4" />
              <span>Clientes Frecuentes</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
              <input
                type="text"
                value={facturaActual.cliente}
                onChange={(e) => setFacturaActual({ ...facturaActual, cliente: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Nombre del cliente"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
              <div className="relative">
                <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="tel"
                  value={facturaActual.telefono}
                  onChange={(e) => manejarCambioTelefono(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="809-000-0000"
                />
              </div>
              
              {clienteSugerido && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700 mb-1">Cliente encontrado:</p>
                  <button
                    onClick={() => seleccionarClienteSugerido(clienteSugerido)}
                    className="text-sm font-medium text-blue-800 hover:text-blue-900"
                  >
                    {clienteSugerido.nombre} - {clienteSugerido.telefono}
                  </button>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Correo (Opcional)</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="email"
                  value={facturaActual.correo}
                  onChange={(e) => setFacturaActual({ ...facturaActual, correo: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="cliente@email.com"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Entrega</label>
            <button
              onClick={abrirSelectorFechaHora}
              className="w-full md:w-auto px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 text-left flex items-center space-x-2"
            >
              <Calendar className="w-5 h-5 text-gray-600" />
              <span>{facturaActual.diaEntrega ? new Date(facturaActual.diaEntrega).toLocaleDateString() : 'Seleccionar fecha'}</span>
            </button>
          </div>
        </div>

        {/* Detalles del Pedido */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Detalles del Pedido</h2>
            <button
              onClick={agregarArticulo}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center space-x-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Añadir Cesta</span>
            </button>
          </div>
          
          {facturaActual.articulos.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg mb-2">Aún no se han añadido cestas.</p>
              <button
                onClick={agregarArticulo}
                className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Añadir primera cesta
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header de columnas */}
              <div className="grid grid-cols-12 gap-4 pb-3 border-b border-gray-200">
                <div className="col-span-1 flex items-center justify-center">
                  <Package className="w-5 h-5 text-orange-600" />
                </div>
                <div className="col-span-4">
                  <span className="text-sm font-semibold text-gray-700">Cesta</span>
                </div>
                <div className="col-span-2 text-center">
                  <span className="text-sm font-semibold text-gray-700 flex items-center justify-center">
                    <span className="w-4 h-4 bg-blue-100 rounded mr-2"></span>
                    Cantidad
                  </span>
                </div>
                <div className="col-span-3 text-center">
                  <span className="text-sm font-semibold text-gray-700 flex items-center justify-center">
                    <span className="w-4 h-4 bg-purple-100 rounded mr-2"></span>
                    Servicios
                  </span>
                </div>
                <div className="col-span-1 text-center">
                  <span className="text-sm font-semibold text-gray-700 flex items-center justify-center">
                    <span className="w-4 h-4 bg-green-100 rounded mr-2"></span>
                    Total
                  </span>
                </div>
                <div className="col-span-1"></div>
              </div>

              {/* Lista de artículos */}
              {facturaActual.articulos.map((articulo, index) => (
                <div key={articulo.id} className="grid grid-cols-12 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="col-span-1 flex items-center justify-center">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Package className="w-4 h-4 text-orange-600" />
                    </div>
                  </div>
                  
                  <div className="col-span-4">
                    <select
                      value={articulo.nombre}
                      onChange={(e) => manejarCambioArticulo(articulo.id, 'nombre', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {preciosServicios.map((prenda) => (
                        <option key={prenda.id} value={prenda.nombre}>
                          {prenda.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="col-span-2 flex items-center justify-center">
                    <div className="flex items-center bg-white rounded-lg border border-gray-300">
                      <button
                        onClick={() => manejarCambioArticulo(articulo.id, 'cantidad', Math.max(1, articulo.cantidad - 1))}
                        className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-l-lg"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={articulo.cantidad}
                        onChange={(e) => manejarCambioArticulo(articulo.id, 'cantidad', parseInt(e.target.value) || 1)}
                        className="w-16 px-2 py-2 text-center border-0 focus:ring-0 text-sm"
                      />
                      <button
                        onClick={() => manejarCambioArticulo(articulo.id, 'cantidad', articulo.cantidad + 1)}
                        className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-r-lg"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="col-span-3 flex items-center justify-center">
                    <select
                      value={articulo.servicio}
                      onChange={(e) => manejarCambioArticulo(articulo.id, 'servicio', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 bg-white"
                    >
                      <option value="lavado">🧺 Lavado - {formatCurrency(preciosServicios.find(p => p.nombre === articulo.nombre)?.precios.lavado || 0)}</option>
                      <option value="planchado">👔 Planchado - {formatCurrency(preciosServicios.find(p => p.nombre === articulo.nombre)?.precios.planchado || 0)}</option>
                      <option value="lavadoYPlanchado">✨ Completo - {formatCurrency(preciosServicios.find(p => p.nombre === articulo.nombre)?.precios.lavadoYPlanchado || 0)}</option>
                    </select>
                  </div>
                  
                  <div className="col-span-1 flex items-center justify-center">
                    <div className="bg-green-100 text-green-800 px-3 py-2 rounded-lg font-semibold text-sm">
                      {formatCurrency(articulo.cantidad * articulo.precio)}
                    </div>
                  </div>
                  
                  <div className="col-span-1 flex items-center justify-center">
                    <button
                      onClick={() => eliminarArticulo(articulo.id)}
                      className="w-8 h-8 bg-red-100 text-red-600 rounded-full hover:bg-red-200 flex items-center justify-center transition-colors"
                      title="Eliminar artículo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totales y botones de acción */}
        {facturaActual.articulos.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatCurrency(facturaActual.subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">ITBIS (18%):</span>
                <span className="font-medium">{formatCurrency(facturaActual.itbis)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">Total:</span>
                  <span className="text-xl font-bold text-blue-600">{formatCurrency(facturaActual.total)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => setShowPaymentModal(true)}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center space-x-2"
              >
                <Save className="w-5 h-5" />
                <span>Guardar y Cobrar</span>
              </button>
              <button
                onClick={() => guardarFactura(true)}
                className="flex-1 bg-yellow-600 text-white py-3 rounded-lg hover:bg-yellow-700 font-medium flex items-center justify-center space-x-2"
              >
                <Clock className="w-5 h-5" />
                <span>Guardar Pendiente</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      <Modal />
      <PaymentMethodModal />
      <DateTimeSelector />
      <ClientesPanel />
    </div>
  );
};

export default NuevaFactura;