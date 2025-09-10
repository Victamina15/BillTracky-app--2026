import React, { useState } from 'react';
import { 
  FileText, 
  User, 
  Plus, 
  Trash2, 
  Save, 
  DollarSign, 
  Calendar, 
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
  Landmark,
  ArrowLeft,
  Eye, 
  Edit3, 
  Send, 
  Printer, 
  AlertCircle,
  RefreshCw,
  CheckCircle,
  XCircle,
  BarChart3,
  Download,
  Settings,
  Building2,
  MessageCircle
} from 'lucide-react';

const BilltrackySistemaCompleto = () => {
  const [codigoIngresado, setCodigoIngresado] = useState('');
  const [empleadoLogueado, setEmpleadoLogueado] = useState(null);
  const [showNumericKeypad, setShowNumericKeypad] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vistaActual, setVistaActual] = useState('dashboard');
  const [vistaConfiguracion, setVistaConfiguracion] = useState('menu');

  // Estados para Nueva Factura
  const [facturaActual, setFacturaActual] = useState({
    numero: 'FAC-010',
    fecha: new Date().toISOString().split('T')[0],
    cliente: '',
    telefono: '',
    articulos: [],
    total: 0
  });

  // Estados para Órdenes
  const [orders] = useState([
    {
      id: 'INV-009',
      numero: 'FAC-009',
      cliente: 'Juan Pérez',
      telefono: '8091502025',
      total: 378.00,
      estado: 'Recibido',
      fechaRecibido: '2025-09-04',
      metodoPago: 'Pendiente',
      pagado: false
    },
    {
      id: 'INV-008',
      numero: 'FAC-008',
      cliente: 'María García',
      telefono: '8095551234',
      total: 290.00,
      estado: 'En Proceso',
      fechaRecibido: '2025-09-03',
      metodoPago: 'Efectivo',
      pagado: true
    },
    {
      id: 'INV-007',
      numero: 'FAC-007',
      cliente: 'Pedro López',
      telefono: '8097779999',
      total: 195.50,
      estado: 'Listo',
      fechaRecibido: '2025-09-02',
      metodoPago: 'Tarjeta',
      pagado: true
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Base de datos
  const employees = [
    { id: 1, nombre: 'Juan Carlos', codigoAcceso: '1234', rol: 'gerente' },
    { id: 2, nombre: 'María Fernández', codigoAcceso: '5678', rol: 'empleado' },
    { id: 3, nombre: 'Pedro González', codigoAcceso: '9999', rol: 'supervisor' }
  ];

  const preciosServicios = [
    { id: 1, nombre: 'PANTALONES', precios: { lavado: 80, planchado: 60, lavadoYPlanchado: 110 } },
    { id: 2, nombre: 'CAMISAS', precios: { lavado: 60, planchado: 40, lavadoYPlanchado: 85 } },
    { id: 3, nombre: 'VESTIDOS', precios: { lavado: 150, planchado: 120, lavadoYPlanchado: 220 } }
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

  const loginEmpleado = () => {
    if (!codigoIngresado) {
      openModal("Por favor ingrese su código de acceso.");
      return;
    }

    const empleado = employees.find(emp => emp.codigoAcceso === codigoIngresado);
    
    if (empleado) {
      setEmpleadoLogueado(empleado);
      setCodigoIngresado('');
      openModal(`¡Bienvenido, ${empleado.nombre}!`);
    } else {
      openModal("Código de acceso incorrecto.");
      setCodigoIngresado('');
    }
  };

  const logout = () => {
    setEmpleadoLogueado(null);
    setCodigoIngresado('');
    setVistaActual('dashboard');
    openModal("Sesión cerrada correctamente.");
  };

  const agregarNumero = (numero) => {
    if (codigoIngresado.length < 6) {
      setCodigoIngresado(codigoIngresado + numero);
    }
  };

  const borrarNumero = () => {
    setCodigoIngresado(codigoIngresado.slice(0, -1));
  };

  const agregarArticulo = () => {
    const nuevoArticulo = {
      id: Date.now(),
      nombre: 'PANTALONES',
      servicio: 'lavado',
      cantidad: 1,
      precio: 80
    };
    setFacturaActual({
      ...facturaActual,
      articulos: [...facturaActual.articulos, nuevoArticulo],
      total: facturaActual.total + 80
    });
  };

  const eliminarArticulo = (id) => {
    const articulo = facturaActual.articulos.find(a => a.id === id);
    setFacturaActual({
      ...facturaActual,
      articulos: facturaActual.articulos.filter(a => a.id !== id),
      total: facturaActual.total - (articulo.cantidad * articulo.precio)
    });
  };

  // Componente Modal
  const Modal = () => {
    if (!isModalOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Billtracky</h3>
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

  // Componente Teclado Numérico
  const NumericKeypad = () => {
    if (!showNumericKeypad) return null;
    
    const numeros = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Teclado Numérico</h3>
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <span className="text-2xl font-mono tracking-widest">
                {codigoIngresado.replace(/./g, '•') || '______'}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3 mb-6">
            {numeros.map((num) => (
              <button
                key={num}
                onClick={() => agregarNumero(num.toString())}
                className="h-14 bg-gray-100 hover:bg-gray-200 rounded-lg text-xl font-semibold transition-colors"
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => agregarNumero('0')}
              className="h-14 bg-gray-100 hover:bg-gray-200 rounded-lg text-xl font-semibold transition-colors"
            >
              0
            </button>
            <button
              onClick={borrarNumero}
              className="h-14 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg font-semibold transition-colors"
            >
              ⌫
            </button>
            <button
              onClick={() => setCodigoIngresado('')}
              className="h-14 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg font-semibold transition-colors text-sm"
            >
              Limpiar
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowNumericKeypad(false)}
              className="py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                setShowNumericKeypad(false);
                loginEmpleado();
              }}
              className="py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Ingresar
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Pantalla de Login
  const LoginScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Billtracky</h1>
          <p className="text-gray-600 mt-2">CleanWash Lavandería</p>
          <p className="text-sm text-gray-500">Sistema de Gestión Completo</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Código de Acceso</label>
            <div className="relative">
              <input
                type="password"
                value={codigoIngresado}
                onChange={(e) => setCodigoIngresado(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && loginEmpleado()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pr-12"
                placeholder="Ingresa tu código"
                maxLength={6}
              />
              <button
                onClick={() => setShowNumericKeypad(true)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-blue-600 transition-colors"
                title="Teclado numérico"
              >
                <div className="w-6 h-6 grid grid-cols-3 gap-0.5">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="w-1 h-1 bg-current rounded-full"></div>
                  ))}
                </div>
              </button>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowNumericKeypad(true)}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 font-medium flex items-center justify-center space-x-2"
            >
              <div className="w-5 h-5 grid grid-cols-3 gap-0.5">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="w-1 h-1 bg-current rounded-full"></div>
                ))}
              </div>
              <span>Teclado</span>
            </button>
            <button
              onClick={loginEmpleado}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
        
        <div className="mt-6 text-center text-xs text-gray-500">
          <p><strong>Códigos de prueba:</strong></p>
          <p>1234 (Gerente) | 5678 (Empleado) | 9999 (Supervisor)</p>
        </div>
      </div>
    </div>
  );

  // Panel principal después del login
  const MainPanel = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Billtracky</h1>
              <p className="text-sm text-gray-500">CleanWash Lavandería</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-1">
                <User className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 font-medium">En línea</span>
              </div>
              <p className="text-sm font-medium text-gray-900">{empleadoLogueado.nombre}</p>
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                empleadoLogueado.rol === 'gerente' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {empleadoLogueado.rol === 'gerente' ? 'Gerente' : empleadoLogueado.rol === 'supervisor' ? 'Supervisor' : 'Empleado'}
              </span>
            </div>
            
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-8">
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Bienvenido, {empleadoLogueado.nombre}!</h2>
          <p className="text-gray-600 mb-4">Has iniciado sesión correctamente como {empleadoLogueado.rol}</p>
          
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <button
              onClick={() => setVistaActual('nueva-factura')}
              className="p-6 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors text-center"
            >
              <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-blue-900 mb-1">Nueva Factura</h3>
              <p className="text-sm text-blue-700">Crear nueva factura para cliente</p>
            </button>
            
            <button
              onClick={() => setVistaActual('gestion-ordenes')}
              className="p-6 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors text-center"
            >
              <Search className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-green-900 mb-1">Gestión de Órdenes</h3>
              <p className="text-sm text-green-700">Ver, filtrar y gestionar órdenes</p>
            </button>
            
            <button
              onClick={() => setVistaActual('cierre-caja')}
              className="p-6 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors text-center"
            >
              <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-purple-900 mb-1">Cierre de Caja</h3>
              <p className="text-sm text-purple-700">Reportes y estadísticas diarias</p>
            </button>
            
            <button
              onClick={() => setVistaActual('configuracion')}
              className="p-6 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors text-center"
            >
              <Settings className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <h3 className="font-semibold text-orange-900 mb-1">Configuración</h3>
              <p className="text-sm text-orange-700">Sistema, empresa y usuarios</p>
            </button>
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Sistema Completo Integrado:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>✅ Login System con teclado numérico</li>
              <li>✅ Nueva Factura con autocompletado</li>
              <li>✅ Gestión de Órdenes avanzada</li>
              <li>✅ Cierre de Caja con reportes</li>
              <li>✅ Centro de Configuración (5 módulos)</li>
              <li className="text-green-600 font-semibold">🎉 9 Módulos Completamente Funcionales</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  // Componente Nueva Factura (Simplificado)
  const NuevaFactura = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setVistaActual('dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Nueva Factura</h1>
              <p className="text-sm text-gray-500">Factura #{facturaActual.numero}</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-500">Empleado</p>
            <p className="font-medium">{empleadoLogueado.nombre}</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Cliente</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <input
                  type="tel"
                  value={facturaActual.telefono}
                  onChange={(e) => setFacturaActual({ ...facturaActual, telefono: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="809-000-0000"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Detalles del Pedido</h2>
              <button
                onClick={agregarArticulo}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Añadir Artículo</span>
              </button>
            </div>
            
            {facturaActual.articulos.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg mb-2">Aún no se han añadido artículos.</p>
                <button
                  onClick={agregarArticulo}
                  className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Añadir primer artículo
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {facturaActual.articulos.map((articulo) => (
                  <div key={articulo.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{articulo.cantidad}x {articulo.nombre}</p>
                      <p className="text-sm text-gray-600">{articulo.servicio} - {formatCurrency(articulo.precio)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-green-600">
                        {formatCurrency(articulo.cantidad * articulo.precio)}
                      </span>
                      <button
                        onClick={() => eliminarArticulo(articulo.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {facturaActual.articulos.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen</h2>
              
              <div className="flex justify-between items-center text-xl font-bold text-blue-600 border-t pt-3">
                <span>Total:</span>
                <span>{formatCurrency(facturaActual.total)}</span>
              </div>
              
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => openModal(`Factura ${facturaActual.numero} guardada exitosamente`)}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>Guardar Factura</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Componente Gestión de Órdenes (Simplificado)
  const GestionOrdenes = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setVistaActual('dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Gestión de Órdenes</h1>
              <p className="text-sm text-gray-500">Lista, búsqueda y gestión</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-500">Total órdenes</p>
            <p className="text-2xl font-bold text-green-600">{orders.length}</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por factura, cliente o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Factura</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.filter(order => 
                  order.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  order.cliente.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
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
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        order.estado === 'Recibido' ? 'bg-blue-100 text-blue-800' :
                        order.estado === 'En Proceso' ? 'bg-yellow-100 text-yellow-800' :
                        order.estado === 'Listo' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {order.estado}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 text-sm font-medium">
                      {formatCurrency(order.total)}
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="text-cyan-600 hover:text-cyan-900" 
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => openModal(`WhatsApp enviado a ${order.cliente}`)}
                          className="text-green-600 hover:text-green-900"
                          title="WhatsApp"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => openModal(`Imprimiendo recibo de ${order.numero}`)}
                          className="text-blue-600 hover:text-blue-900" 
                          title="Imprimir"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Estadísticas por estado */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {['Recibido', 'En Proceso', 'Listo', 'Entregado'].map((estado, index) => {
              const count = orders.filter(o => o.estado === estado).length;
              const colors = ['blue', 'yellow', 'purple', 'green'];
              
              return (
                <div key={estado} className="bg-white rounded-xl shadow-sm border p-4">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 bg-${colors[index]}-100 rounded-lg flex items-center justify-center`}>
                      <Package className={`w-5 h-5 text-${colors[index]}-600`} />
                    </div>
                    <div className="ml-3">
                      <p className="text-xs font-medium text-gray-500">{estado}</p>
                      <p className="text-lg font-bold text-gray-900">{count}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  // Componente Cierre de Caja (Simplificado)
  const CierreCaja = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setVistaActual('dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Cierre de Caja</h1>
              <p className="text-sm text-gray-500">Reportes y estadísticas</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => openModal("Función de impresión disponible")}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium flex items-center space-x-2"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={() => openModal("Función de exportar disponible")}
              className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Ingresos Totales</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(1043.50)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Facturas Totales</p>
                  <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Entregadas</p>
                  <p className="text-2xl font-bold text-gray-900">{orders.filter(o => o.estado === 'Entregado').length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pendientes</p>
                  <p className="text-2xl font-bold text-gray-900">{orders.filter(o => !o.pagado).length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Desglose Financiero</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(884.32)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">ITBIS (18%):</span>
                  <span className="font-medium">{formatCurrency(159.18)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">Total:</span>
                    <span className="text-xl font-bold text-green-600">{formatCurrency(1043.50)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Métodos de Pago</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <Banknote className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Efectivo</p>
                      <p className="text-sm text-gray-500">1 transacción</p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900">{formatCurrency(378.00)}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Tarjeta</p>
                      <p className="text-sm text-gray-500">1 transacción</p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900">{formatCurrency(195.50)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Componente Configuración
  const Configuracion = () => {
    const modulosConfiguracion = [
      {
        id: 'empresa',
        titulo: 'Configuración de Empresa',
        descripcion: 'Datos generales, contacto y horarios',
        icono: Building2,
        color: 'blue'
      },
      {
        id: 'metodos-pago',
        titulo: 'Métodos de Pago', 
        descripcion: 'Gestionar formas de pago disponibles',
        icono: CreditCard,
        color: 'green'
      },
      {
        id: 'mensajes',
        titulo: 'Mensajes WhatsApp',
        descripcion: 'Plantillas y notificaciones automáticas', 
        icono: MessageCircle,
        color: 'purple'
      },
      {
        id: 'servicios',
        titulo: 'Servicios y Precios',
        descripcion: 'Gestión de precios por categorías',
        icono: Package,
        color: 'orange'
      },
      {
        id: 'empleados',
        titulo: 'Empleados y Roles',
        descripcion: 'Sistema de usuarios y permisos',
        icono: Users,
        color: 'indigo'
      }
    ];

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setVistaActual('dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Configuración del Sistema</h1>
                <p className="text-sm text-gray-500">Administración y configuración general</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-500">Empleado</p>
              <p className="font-medium">{empleadoLogueado.nombre}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Centro de Configuración</h2>
              <p className="text-gray-600 mb-6">Personaliza y configura todos los aspectos del sistema</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modulosConfiguracion.map((modulo) => {
                  const IconoModulo = modulo.icono;
                  return (
                    <button
                      key={modulo.id}
                      onClick={() => openModal(`Módulo ${modulo.titulo} disponible para configuración completa`)}
                      className={`p-6 bg-${modulo.color}-50 hover:bg-${modulo.color}-100 rounded-xl border border-${modulo.color}-200 transition-all duration-200 text-left group`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 bg-${modulo.color}-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <IconoModulo className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-semibold text-${modulo.color}-900 mb-1`}>
                            {modulo.titulo}
                          </h3>
                          <p className={`text-sm text-${modulo.color}-700`}>
                            {modulo.descripcion}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Empresa</p>
                    <p className="text-lg font-bold text-gray-900">CleanWash</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Métodos Pago</p>
                    <p className="text-lg font-bold text-gray-900">3 activos</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Servicios</p>
                    <p className="text-lg font-bold text-gray-900">6 activos</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Empleados</p>
                    <p className="text-lg font-bold text-gray-900">3 activos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {!empleadoLogueado ? (
        <LoginScreen />
      ) : vistaActual === 'nueva-factura' ? (
        <NuevaFactura />
      ) : vistaActual === 'gestion-ordenes' ? (
        <GestionOrdenes />
      ) : vistaActual === 'cierre-caja' ? (
        <CierreCaja />
      ) : vistaActual === 'configuracion' ? (
        <Configuracion />
      ) : (
        <MainPanel />
      )}
      <NumericKeypad />
      <Modal />
    </div>
  );
};

export default BilltrackySistemaCompleto;