import React, { useState } from 'react';
import { 
  Building2, 
  Save, 
  X, 
  Check, 
  Mail, 
  Phone, 
  MapPin,
  Globe,
  Camera,
  Upload,
  Edit3,
  Settings,
  AlertCircle,
  Eye,
  EyeOff,
  Copy,
  RefreshCw
} from 'lucide-react';

const ConfiguracionEmpresa = () => {
  const [configuracionEmpresa, setConfiguracionEmpresa] = useState({
    nombre: 'CleanWash Lavandería',
    nombreComercial: 'CleanWash',
    email: 'admin@cleanwash.com',
    telefono: '809-555-0123',
    telefono2: '809-555-0124',
    direccion: 'Av. Principal #123, Santo Domingo',
    sucursal: 'Sucursal Centro',
    ciudad: 'Santo Domingo',
    provincia: 'Distrito Nacional',
    codigoPostal: '10101',
    rnc: '131-12345-6',
    website: 'www.cleanwash.com',
    redesSociales: {
      facebook: '@cleanwashrd',
      instagram: '@cleanwash_rd',
      whatsapp: '8095550123'
    },
    horarios: {
      lunes: { apertura: '08:00', cierre: '18:00', activo: true },
      martes: { apertura: '08:00', cierre: '18:00', activo: true },
      miercoles: { apertura: '08:00', cierre: '18:00', activo: true },
      jueves: { apertura: '08:00', cierre: '18:00', activo: true },
      viernes: { apertura: '08:00', cierre: '18:00', activo: true },
      sabado: { apertura: '08:00', cierre: '16:00', activo: true },
      domingo: { apertura: '09:00', cierre: '14:00', activo: false }
    },
    configuracionFactura: {
      mostrarRnc: true,
      mostrarDireccion: true,
      mostrarTelefono: true,
      mostrarEmail: true,
      mensajePie: 'Gracias por preferirnos - CleanWash Lavandería'
    }
  });

  const [activeTab, setActiveTab] = useState('general');
  const [modalMessage, setModalMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);

  const openModal = (message) => {
    setModalMessage(message);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalMessage('');
  };

  const handleChange = (campo, valor, seccion = null) => {
    setHasChanges(true);
    if (seccion) {
      setConfiguracionEmpresa(prev => ({
        ...prev,
        [seccion]: {
          ...prev[seccion],
          [campo]: valor
        }
      }));
    } else {
      setConfiguracionEmpresa(prev => ({
        ...prev,
        [campo]: valor
      }));
    }
  };

  const guardarConfiguracion = () => {
    if (!configuracionEmpresa.nombre || !configuracionEmpresa.telefono) {
      openModal("Complete al menos el nombre y teléfono de la empresa.");
      return;
    }

    setHasChanges(false);
    openModal("Configuración de empresa actualizada exitosamente.");
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        openModal("El archivo es muy grande. El tamaño máximo es 5MB.");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
        setHasChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const diasSemana = {
    lunes: 'Lunes',
    martes: 'Martes',
    miercoles: 'Miércoles',
    jueves: 'Jueves',
    viernes: 'Viernes',
    sabado: 'Sábado',
    domingo: 'Domingo'
  };

  const tabs = [
    { id: 'general', label: 'Información General', icon: Building2 },
    { id: 'contacto', label: 'Contacto y Ubicación', icon: Phone },
    { id: 'horarios', label: 'Horarios de Atención', icon: Settings },
    { id: 'facturacion', label: 'Configuración de Factura', icon: Settings }
  ];

  const Modal = () => {
    if (!isModalOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Configuración de Empresa</h3>
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

  const FacturaPreview = () => {
    if (!showPreview) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Vista Previa de Factura</h3>
            <button
              onClick={() => setShowPreview(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="text-center border-b pb-4 mb-4">
              <h2 className="text-xl font-bold">{configuracionEmpresa.nombreComercial}</h2>
              <p className="text-sm text-gray-600">{configuracionEmpresa.nombre}</p>
              {configuracionEmpresa.configuracionFactura.mostrarRnc && (
                <p className="text-xs">RNC: {configuracionEmpresa.rnc}</p>
              )}
            </div>
            
            <div className="space-y-1 text-xs">
              {configuracionEmpresa.configuracionFactura.mostrarDireccion && (
                <p>{configuracionEmpresa.direccion}</p>
              )}
              {configuracionEmpresa.configuracionFactura.mostrarTelefono && (
                <p>Tel: {configuracionEmpresa.telefono}</p>
              )}
              {configuracionEmpresa.configuracionFactura.mostrarEmail && (
                <p>Email: {configuracionEmpresa.email}</p>
              )}
            </div>
            
            <div className="border-t pt-4 mt-4">
              <p className="text-xs font-medium">FACTURA #FAC-001</p>
              <p className="text-xs">Cliente: Juan Pérez</p>
              <p className="text-xs">Fecha: {new Date().toLocaleDateString()}</p>
            </div>
            
            <div className="border-t pt-2 mt-4 text-center">
              <p className="text-xs italic">{configuracionEmpresa.configuracionFactura.mensajePie}</p>
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
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Configuración de Empresa</h1>
                <p className="text-gray-600">Datos generales y configuración del negocio</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowPreview(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>Vista Previa</span>
              </button>
              <button
                onClick={guardarConfiguracion}
                disabled={!hasChanges}
                className={`px-6 py-3 rounded-lg font-medium flex items-center space-x-2 ${
                  hasChanges 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Save className="w-5 h-5" />
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pestañas */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Pestaña Información General */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la Empresa *</label>
                    <input
                      type="text"
                      value={configuracionEmpresa.nombre}
                      onChange={(e) => handleChange('nombre', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: CleanWash Lavandería S.R.L."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Comercial</label>
                    <input
                      type="text"
                      value={configuracionEmpresa.nombreComercial}
                      onChange={(e) => handleChange('nombreComercial', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: CleanWash"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">RNC</label>
                    <input
                      type="text"
                      value={configuracionEmpresa.rnc}
                      onChange={(e) => handleChange('rnc', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: 131-12345-6"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sitio Web</label>
                    <input
                      type="text"
                      value={configuracionEmpresa.website}
                      onChange={(e) => handleChange('website', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: www.empresa.com"
                    />
                  </div>
                </div>

                {/* Logo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Logo de la Empresa</label>
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo" className="w-full h-full object-contain rounded-lg" />
                      ) : (
                        <Camera className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        id="logo-upload"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="logo-upload"
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 cursor-pointer flex items-center space-x-2"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Subir Logo</span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG hasta 5MB</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pestaña Contacto y Ubicación */}
            {activeTab === 'contacto' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Principal *</label>
                    <div className="relative">
                      <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="email"
                        value={configuracionEmpresa.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="admin@empresa.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono Principal *</label>
                    <div className="relative">
                      <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="tel"
                        value={configuracionEmpresa.telefono}
                        onChange={(e) => handleChange('telefono', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="809-000-0000"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono Secundario</label>
                    <div className="relative">
                      <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="tel"
                        value={configuracionEmpresa.telefono2}
                        onChange={(e) => handleChange('telefono2', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="809-000-0001"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sucursal</label>
                    <input
                      type="text"
                      value={configuracionEmpresa.sucursal}
                      onChange={(e) => handleChange('sucursal', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: Sucursal Centro"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dirección Completa</label>
                  <div className="relative">
                    <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                    <textarea
                      value={configuracionEmpresa.direccion}
                      onChange={(e) => handleChange('direccion', e.target.value)}
                      rows={3}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Av. Principal #123, Sector Centro, Santo Domingo"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
                    <input
                      type="text"
                      value={configuracionEmpresa.ciudad}
                      onChange={(e) => handleChange('ciudad', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Santo Domingo"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Provincia</label>
                    <input
                      type="text"
                      value={configuracionEmpresa.provincia}
                      onChange={(e) => handleChange('provincia', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Distrito Nacional"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Código Postal</label>
                    <input
                      type="text"
                      value={configuracionEmpresa.codigoPostal}
                      onChange={(e) => handleChange('codigoPostal', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="10101"
                    />
                  </div>
                </div>

                {/* Redes Sociales */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Redes Sociales</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                      <input
                        type="text"
                        value={configuracionEmpresa.redesSociales.facebook}
                        onChange={(e) => handleChange('facebook', e.target.value, 'redesSociales')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="@empresa"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                      <input
                        type="text"
                        value={configuracionEmpresa.redesSociales.instagram}
                        onChange={(e) => handleChange('instagram', e.target.value, 'redesSociales')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="@empresa"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Business</label>
                      <input
                        type="text"
                        value={configuracionEmpresa.redesSociales.whatsapp}
                        onChange={(e) => handleChange('whatsapp', e.target.value, 'redesSociales')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="8095550000"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pestaña Horarios */}
            {activeTab === 'horarios' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Horarios de Atención</h3>
                  <div className="space-y-4">
                    {Object.entries(configuracionEmpresa.horarios).map(([dia, horario]) => (
                      <div key={dia} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-24">
                          <span className="font-medium text-gray-900">{diasSemana[dia]}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={horario.activo}
                            onChange={(e) => {
                              const nuevosHorarios = {
                                ...configuracionEmpresa.horarios,
                                [dia]: { ...horario, activo: e.target.checked }
                              };
                              handleChange('horarios', nuevosHorarios);
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-600">Abierto</span>
                        </div>
                        
                        {horario.activo && (
                          <>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Apertura</label>
                              <input
                                type="time"
                                value={horario.apertura}
                                onChange={(e) => {
                                  const nuevosHorarios = {
                                    ...configuracionEmpresa.horarios,
                                    [dia]: { ...horario, apertura: e.target.value }
                                  };
                                  handleChange('horarios', nuevosHorarios);
                                }}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Cierre</label>
                              <input
                                type="time"
                                value={horario.cierre}
                                onChange={(e) => {
                                  const nuevosHorarios = {
                                    ...configuracionEmpresa.horarios,
                                    [dia]: { ...horario, cierre: e.target.value }
                                  };
                                  handleChange('horarios', nuevosHorarios);
                                }}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                            </div>
                          </>
                        )}
                        
                        {!horario.activo && (
                          <span className="text-red-600 text-sm font-medium">Cerrado</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Pestaña Configuración de Factura */}
            {activeTab === 'facturacion' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración de Factura</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Mostrar RNC en facturas</p>
                        <p className="text-sm text-gray-600">Incluir número de RNC en las facturas impresas</p>
                      </div>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={configuracionEmpresa.configuracionFactura.mostrarRnc}
                          onChange={(e) => handleChange('mostrarRnc', e.target.checked, 'configuracionFactura')}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Mostrar dirección en facturas</p>
                        <p className="text-sm text-gray-600">Incluir dirección completa en las facturas</p>
                      </div>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={configuracionEmpresa.configuracionFactura.mostrarDireccion}
                          onChange={(e) => handleChange('mostrarDireccion', e.target.checked, 'configuracionFactura')}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Mostrar teléfono en facturas</p>
                        <p className="text-sm text-gray-600">Incluir número de teléfono en las facturas</p>
                      </div>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={configuracionEmpresa.configuracionFactura.mostrarTelefono}
                          onChange={(e) => handleChange('mostrarTelefono', e.target.checked, 'configuracionFactura')}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Mostrar email en facturas</p>
                        <p className="text-sm text-gray-600">Incluir dirección de email en las facturas</p>
                      </div>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={configuracionEmpresa.configuracionFactura.mostrarEmail}
                          onChange={(e) => handleChange('mostrarEmail', e.target.checked, 'configuracionFactura')}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </label>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mensaje al pie de factura</label>
                    <textarea
                      value={configuracionEmpresa.configuracionFactura.mensajePie}
                      onChange={(e) => handleChange('mensajePie', e.target.value, 'configuracionFactura')}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Mensaje que aparecerá al final de cada factura"
                    />
                    <p className="text-xs text-gray-500 mt-1">Este mensaje aparecerá al final de todas las facturas impresas</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Información adicional */}
        {hasChanges && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Cambios sin guardar</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Has realizado cambios en la configuración. No olvides guardar para aplicar los cambios.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      <Modal />
      <FacturaPreview />
    </div>
  );
};

export default ConfiguracionEmpresa;