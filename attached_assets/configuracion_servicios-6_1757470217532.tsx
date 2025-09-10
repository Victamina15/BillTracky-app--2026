import React, { useState } from 'react';
import { 
  Settings, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  Check, 
  Package, 
  DollarSign,
  Wrench,
  Copy,
  RefreshCw,
  AlertCircle,
  FileText,
  Calculator,
  TrendingUp,
  Eye,
  EyeOff
} from 'lucide-react';

const ConfiguracionServicios = () => {
  const [servicios, setServicios] = useState([
    { 
      id: 1, 
      nombre: 'PANTALONES', 
      precios: { lavado: 80, planchado: 60, lavadoYPlanchado: 110 },
      activo: true,
      categoria: 'Ropa Básica',
      fechaCreacion: '2024-01-15'
    },
    { 
      id: 2, 
      nombre: 'CAMISAS', 
      precios: { lavado: 60, planchado: 40, lavadoYPlanchado: 85 },
      activo: true,
      categoria: 'Ropa Básica',
      fechaCreacion: '2024-01-15'
    },
    { 
      id: 3, 
      nombre: 'VESTIDOS', 
      precios: { lavado: 150, planchado: 120, lavadoYPlanchado: 220 },
      activo: true,
      categoria: 'Ropa Especial',
      fechaCreacion: '2024-01-15'
    },
    { 
      id: 4, 
      nombre: 'BLUSAS', 
      precios: { lavado: 60, planchado: 40, lavadoYPlanchado: 85 },
      activo: true,
      categoria: 'Ropa Básica',
      fechaCreacion: '2024-01-15'
    },
    { 
      id: 5, 
      nombre: 'SÁBANAS', 
      precios: { lavado: 100, planchado: 80, lavadoYPlanchado: 150 },
      activo: true,
      categoria: 'Hogar',
      fechaCreacion: '2024-01-15'
    },
    { 
      id: 6, 
      nombre: 'TOALLAS (GRANDE)', 
      precios: { lavado: 40, planchado: 30, lavadoYPlanchado: 60 },
      activo: true,
      categoria: 'Hogar',
      fechaCreacion: '2024-01-15'
    }
  ]);

  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [modalMessage, setModalMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showInactive, setShowInactive] = useState(false);

  const [servicioForm, setServicioForm] = useState({
    nombre: '',
    categoria: 'Ropa Básica',
    lavado: 0,
    planchado: 0,
    lavadoYPlanchado: 0
  });

  const [bulkUpdateForm, setBulkUpdateForm] = useState({
    tipo: 'porcentaje',
    valor: 0,
    categoria: 'all',
    servicio: 'all'
  });

  const categorias = [
    'Ropa Básica',
    'Ropa Especial', 
    'Hogar',
    'Delicados',
    'Tintorería'
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

  const openServiceModal = (service = null) => {
    if (service) {
      setSelectedService(service);
      setServicioForm({
        nombre: service.nombre,
        categoria: service.categoria,
        lavado: service.precios.lavado,
        planchado: service.precios.planchado,
        lavadoYPlanchado: service.precios.lavadoYPlanchado
      });
    } else {
      setSelectedService(null);
      setServicioForm({
        nombre: '',
        categoria: 'Ropa Básica',
        lavado: 0,
        planchado: 0,
        lavadoYPlanchado: 0
      });
    }
    setShowServiceModal(true);
  };

  const saveService = () => {
    if (!servicioForm.nombre || servicioForm.lavado <= 0) {
      openModal("Complete el nombre y al menos el precio de lavado.");
      return;
    }

    const precios = {
      lavado: servicioForm.lavado,
      planchado: servicioForm.planchado || servicioForm.lavado * 0.75,
      lavadoYPlanchado: servicioForm.lavadoYPlanchado || servicioForm.lavado * 1.4
    };

    if (selectedService) {
      setServicios(servicios.map(serv => 
        serv.id === selectedService.id 
          ? { 
              ...serv, 
              nombre: servicioForm.nombre.toUpperCase(),
              categoria: servicioForm.categoria,
              precios
            }
          : serv
      ));
      openModal("Servicio actualizado exitosamente.");
    } else {
      const newService = {
        id: Math.max(...servicios.map(s => s.id)) + 1,
        nombre: servicioForm.nombre.toUpperCase(),
        categoria: servicioForm.categoria,
        precios,
        activo: true,
        fechaCreacion: new Date().toISOString().split('T')[0]
      };
      setServicios([...servicios, newService]);
      openModal(`Servicio "${newService.nombre}" creado exitosamente.`);
    }

    setShowServiceModal(false);
    setSelectedService(null);
  };

  const toggleServiceStatus = (serviceId) => {
    setServicios(servicios.map(serv => 
      serv.id === serviceId 
        ? { ...serv, activo: !serv.activo }
        : serv
    ));
    
    const service = servicios.find(serv => serv.id === serviceId);
    openModal(`Servicio ${service.activo ? 'desactivado' : 'activado'} exitosamente.`);
  };

  const deleteService = () => {
    if (!serviceToDelete) return;
    
    setServicios(servicios.filter(serv => serv.id !== serviceToDelete.id));
    openModal("Servicio eliminado exitosamente.");
    setShowDeleteConfirmModal(false);
    setServiceToDelete(null);
  };

  const duplicateService = (service) => {
    const newService = {
      id: Math.max(...servicios.map(s => s.id)) + 1,
      nombre: `${service.nombre} (COPIA)`,
      categoria: service.categoria,
      precios: { ...service.precios },
      activo: true,
      fechaCreacion: new Date().toISOString().split('T')[0]
    };
    setServicios([...servicios, newService]);
    openModal(`Servicio "${newService.nombre}" duplicado exitosamente.`);
  };

  const applyBulkPriceUpdate = () => {
    if (bulkUpdateForm.valor <= 0) {
      openModal("Ingrese un valor válido mayor a 0.");
      return;
    }

    let serviciosActualizados = [...servicios];
    let serviciosAfectados = 0;

    serviciosActualizados = serviciosActualizados.map(servicio => {
      if (bulkUpdateForm.categoria !== 'all' && servicio.categoria !== bulkUpdateForm.categoria) {
        return servicio;
      }

      serviciosAfectados++;
      const nuevosPrecios = { ...servicio.precios };

      const serviciosAActualizar = bulkUpdateForm.servicio === 'all' 
        ? ['lavado', 'planchado', 'lavadoYPlanchado']
        : [bulkUpdateForm.servicio];

      serviciosAActualizar.forEach(tipoServicio => {
        if (bulkUpdateForm.tipo === 'porcentaje') {
          nuevosPrecios[tipoServicio] = Math.round(
            nuevosPrecios[tipoServicio] * (1 + bulkUpdateForm.valor / 100)
          );
        } else {
          nuevosPrecios[tipoServicio] = Math.round(
            nuevosPrecios[tipoServicio] + bulkUpdateForm.valor
          );
        }
      });

      return { ...servicio, precios: nuevosPrecios };
    });

    setServicios(serviciosActualizados);
    setShowBulkEditModal(false);
    openModal(`Precios actualizados en ${serviciosAfectados} servicios.`);
  };

  const filteredServices = servicios.filter(service => {
    const matchesSearch = service.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || service.categoria === filterCategory;
    const matchesStatus = showInactive || service.activo;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const stats = {
    total: servicios.length,
    activos: servicios.filter(s => s.activo).length,
    inactivos: servicios.filter(s => !s.activo).length,
    categorias: [...new Set(servicios.map(s => s.categoria))].length,
    promedioLavado: servicios.reduce((sum, s) => sum + s.precios.lavado, 0) / servicios.length,
    promedioCompleto: servicios.reduce((sum, s) => sum + s.precios.lavadoYPlanchado, 0) / servicios.length
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Configuración de Servicios</h3>
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

  const ServiceModal = () => {
    if (!showServiceModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {selectedService ? 'Editar Servicio' : 'Nuevo Servicio'}
            </h3>
            <button
              onClick={() => setShowServiceModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Servicio *</label>
              <input
                type="text"
                value={servicioForm.nombre}
                onChange={(e) => setServicioForm({...servicioForm, nombre: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Ej: CHAQUETAS"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoría *</label>
              <select
                value={servicioForm.categoria}
                onChange={(e) => setServicioForm({...servicioForm, categoria: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                {categorias.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Precio Lavado *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={servicioForm.lavado}
                  onChange={(e) => setServicioForm({...servicioForm, lavado: parseFloat(e.target.value) || 0})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Precio Planchado</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={servicioForm.planchado}
                  onChange={(e) => setServicioForm({...servicioForm, planchado: parseFloat(e.target.value) || 0})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Auto-calculado si se deja vacío"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Precio Completo</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={servicioForm.lavadoYPlanchado}
                  onChange={(e) => setServicioForm({...servicioForm, lavadoYPlanchado: parseFloat(e.target.value) || 0})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Auto-calculado si se deja vacío"
                />
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Vista Previa de Precios:</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Lavado:</span>
                  <span className="font-medium">{formatCurrency(servicioForm.lavado)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Planchado:</span>
                  <span className="font-medium">
                    {formatCurrency(servicioForm.planchado || servicioForm.lavado * 0.75)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Completo:</span>
                  <span className="font-medium">
                    {formatCurrency(servicioForm.lavadoYPlanchado || servicioForm.lavado * 1.4)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3 mt-6">
            <button
              onClick={() => setShowServiceModal(false)}
              className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={saveService}
              className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              {selectedService ? 'Actualizar' : 'Crear'} Servicio
            </button>
          </div>
        </div>
      </div>
    );
  };

  const BulkEditModal = () => {
    if (!showBulkEditModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Actualización Masiva de Precios</h3>
            <button
              onClick={() => setShowBulkEditModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Ajuste</label>
              <select
                value={bulkUpdateForm.tipo}
                onChange={(e) => setBulkUpdateForm({...bulkUpdateForm, tipo: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="porcentaje">Aumento/Descuento Porcentual</option>
                <option value="fijo">Aumento/Descuento Fijo</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor {bulkUpdateForm.tipo === 'porcentaje' ? '(%)' : '(RD$)'}
              </label>
              <input
                type="number"
                step="0.01"
                value={bulkUpdateForm.valor}
                onChange={(e) => setBulkUpdateForm({...bulkUpdateForm, valor: parseFloat(e.target.value) || 0})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={bulkUpdateForm.tipo === 'porcentaje' ? "Ej: 10 (para 10%)" : "Ej: 5.00"}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
              <select
                value={bulkUpdateForm.categoria}
                onChange={(e) => setBulkUpdateForm({...bulkUpdateForm, categoria: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas las categorías</option>
                {categorias.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Servicio</label>
              <select
                value={bulkUpdateForm.servicio}
                onChange={(e) => setBulkUpdateForm({...bulkUpdateForm, servicio: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los servicios</option>
                <option value="lavado">Solo Lavado</option>
                <option value="planchado">Solo Planchado</option>
                <option value="lavadoYPlanchado">Solo Completo</option>
              </select>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                <div className="text-sm text-yellow-700">
                  <p className="font-medium">Vista previa del cambio:</p>
                  <p>
                    {bulkUpdateForm.tipo === 'porcentaje' 
                      ? `${bulkUpdateForm.valor > 0 ? 'Aumentar' : 'Reducir'} precios en ${Math.abs(bulkUpdateForm.valor)}%`
                      : `${bulkUpdateForm.valor > 0 ? 'Aumentar' : 'Reducir'} precios en ${formatCurrency(Math.abs(bulkUpdateForm.valor))}`
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3 mt-6">
            <button
              onClick={() => setShowBulkEditModal(false)}
              className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={applyBulkPriceUpdate}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Aplicar Cambios
            </button>
          </div>
        </div>
      </div>
    );
  };

  const DeleteConfirmModal = () => {
    if (!showDeleteConfirmModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Eliminar Servicio</h3>
            <p className="text-gray-600 mb-6">
              ¿Está seguro que desea eliminar el servicio <strong>{serviceToDelete?.nombre}</strong>? 
              Esta acción no se puede deshacer.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirmModal(false)}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={deleteService}
                className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Configuración de Servicios</h1>
                <p className="text-gray-600">Gestiona precios y servicios de la lavandería</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowBulkEditModal(true)}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium flex items-center space-x-2"
              >
                <Calculator className="w-4 h-4" />
                <span>Actualización Masiva</span>
              </button>
              <button
                onClick={() => openServiceModal()}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Nuevo Servicio</span>
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500">Total</p>
                <p className="text-lg font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500">Activos</p>
                <p className="text-lg font-bold text-gray-900">{stats.activos}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <X className="w-5 h-5 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500">Inactivos</p>
                <p className="text-lg font-bold text-gray-900">{stats.inactivos}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Wrench className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500">Categorías</p>
                <p className="text-lg font-bold text-gray-900">{stats.categorias}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500">Prom. Lavado</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.promedioLavado)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500">Prom. Completo</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.promedioCompleto)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Package className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar servicio por nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            
            <div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Todas las categorías</option>
                {categorias.map((categoria) => (
                  <option key={categoria} value={categoria}>{categoria}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">Mostrar inactivos</span>
              </label>
            </div>
          </div>
        </div>

        {/* Lista de servicios */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr className="border-b">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Servicio</th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">Lavado</th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">Planchado</th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">Completo</th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">Estado</th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((servicio, index) => (
                  <tr key={servicio.id} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'} ${!servicio.activo ? 'opacity-60' : ''}`}>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                          <Package className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">{servicio.nombre}</span>
                          <p className="text-sm text-gray-500">{servicio.categoria}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {formatCurrency(servicio.precios.lavado)}
                      </span>
                    </td>
                    
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        {formatCurrency(servicio.precios.planchado)}
                      </span>
                    </td>
                    
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                        {formatCurrency(servicio.precios.lavadoYPlanchado)}
                      </span>
                    </td>
                    
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => toggleServiceStatus(servicio.id)}
                        className={`px-3 py-1 text-xs font-medium rounded-full cursor-pointer hover:opacity-80 ${
                          servicio.activo 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {servicio.activo ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => openServiceModal(servicio)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar servicio"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => duplicateService(servicio)}
                          className="text-green-600 hover:text-green-900"
                          title="Duplicar servicio"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => {
                            setServiceToDelete(servicio);
                            setShowDeleteConfirmModal(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar servicio"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredServices.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p>No se encontraron servicios con los filtros aplicados</p>
              <button
                onClick={() => openServiceModal()}
                className="mt-4 text-purple-600 hover:text-purple-800 font-medium"
              >
                Crear primer servicio
              </button>
            </div>
          )}
        </div>

        {/* Resumen por categorías */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen por Categorías</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categorias.map((categoria) => {
              const serviciosCategoria = servicios.filter(s => s.categoria === categoria && s.activo);
              const promedioLavado = serviciosCategoria.length > 0 
                ? serviciosCategoria.reduce((sum, s) => sum + s.precios.lavado, 0) / serviciosCategoria.length 
                : 0;
              const promedioCompleto = serviciosCategoria.length > 0 
                ? serviciosCategoria.reduce((sum, s) => sum + s.precios.lavadoYPlanchado, 0) / serviciosCategoria.length 
                : 0;
              
              return (
                <div key={categoria} className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">{categoria}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Servicios:</span>
                      <span className="font-medium">{serviciosCategoria.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Prom. Lavado:</span>
                      <span className="font-medium">{formatCurrency(promedioLavado)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Prom. Completo:</span>
                      <span className="font-medium">{formatCurrency(promedioCompleto)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modales */}
      <Modal />
      <ServiceModal />
      <BulkEditModal />
      <DeleteConfirmModal />
    </div>
  );
};

export default ConfiguracionServicios;