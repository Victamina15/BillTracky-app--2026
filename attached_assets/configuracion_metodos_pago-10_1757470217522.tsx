import React, { useState } from 'react';
import { Save, Plus, Edit2, Trash2, CreditCard, Smartphone, Building, DollarSign, ToggleLeft, ToggleRight, Eye } from 'lucide-react';

const ConfiguracionMetodosPago = () => {
  const [metodosPago, setMetodosPago] = useState([
    {
      id: 1,
      nombre: 'Efectivo',
      icono: '💵',
      activo: true,
      requiereReferencia: false,
      comision: 0,
      descripcion: 'Pago en efectivo',
      mostrarEnFactura: true,
      color: '#10B981'
    },
    {
      id: 2,
      nombre: 'Tarjeta de Crédito',
      icono: '💳',
      activo: true,
      requiereReferencia: true,
      comision: 3.5,
      descripcion: 'Visa, Mastercard, American Express',
      mostrarEnFactura: true,
      color: '#3B82F6'
    },
    {
      id: 3,
      nombre: 'Tarjeta de Débito',
      icono: '🏧',
      activo: true,
      requiereReferencia: true,
      comision: 2.0,
      descripcion: 'Débito bancario',
      mostrarEnFactura: true,
      color: '#8B5CF6'
    },
    {
      id: 4,
      nombre: 'Transferencia Bancaria',
      icono: '🏦',
      activo: true,
      requiereReferencia: true,
      comision: 0,
      descripcion: 'Transferencia entre cuentas',
      mostrarEnFactura: true,
      color: '#F59E0B'
    },
    {
      id: 5,
      nombre: 'Pago Móvil',
      icono: '📱',
      activo: false,
      requiereReferencia: true,
      comision: 1.5,
      descripcion: 'Pagos por celular',
      mostrarEnFactura: true,
      color: '#EF4444'
    }
  ]);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [metodoEditando, setMetodoEditando] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroActivo, setFiltroActivo] = useState('todos');

  const iconosDisponibles = [
    { emoji: '💵', nombre: 'Efectivo' },
    { emoji: '💳', nombre: 'Tarjeta' },
    { emoji: '🏧', nombre: 'Débito' },
    { emoji: '🏦', nombre: 'Banco' },
    { emoji: '📱', nombre: 'Móvil' },
    { emoji: '💰', nombre: 'Dinero' },
    { emoji: '🎫', nombre: 'Vale' },
    { emoji: '🔗', nombre: 'Enlace' },
    { emoji: '⚡', nombre: 'Rápido' },
    { emoji: '🌐', nombre: 'Online' }
  ];

  const coloresDisponibles = [
    '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', 
    '#EF4444', '#6B7280', '#EC4899', '#14B8A6'
  ];

  const abrirModal = (metodo = null) => {
    setMetodoEditando(metodo || {
      id: Date.now(),
      nombre: '',
      icono: '💳',
      activo: true,
      requiereReferencia: false,
      comision: 0,
      descripcion: '',
      mostrarEnFactura: true,
      color: '#3B82F6'
    });
    setModalAbierto(true);
  };

  const guardarMetodo = () => {
    if (!metodoEditando.nombre) return;

    if (metodoEditando.id && metodosPago.find(m => m.id === metodoEditando.id)) {
      setMetodosPago(metodosPago.map(m => 
        m.id === metodoEditando.id ? metodoEditando : m
      ));
    } else {
      setMetodosPago([...metodosPago, { ...metodoEditando, id: Date.now() }]);
    }
    
    setModalAbierto(false);
    setMetodoEditando(null);
  };

  const eliminarMetodo = (id) => {
    if (confirm('¿Está seguro de eliminar este método de pago?')) {
      setMetodosPago(metodosPago.filter(m => m.id !== id));
    }
  };

  const toggleActivo = (id) => {
    setMetodosPago(metodosPago.map(m => 
      m.id === id ? { ...m, activo: !m.activo } : m
    ));
  };

  const metodosFiltrados = metodosPago.filter(metodo => {
    const cumpleBusqueda = metodo.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                          metodo.descripcion.toLowerCase().includes(busqueda.toLowerCase());
    
    const cumpleFiltro = filtroActivo === 'todos' || 
                        (filtroActivo === 'activos' && metodo.activo) ||
                        (filtroActivo === 'inactivos' && !metodo.activo);
    
    return cumpleBusqueda && cumpleFiltro;
  });

  const estadisticas = {
    total: metodosPago.length,
    activos: metodosPago.filter(m => m.activo).length,
    inactivos: metodosPago.filter(m => !m.activo).length,
    conComision: metodosPago.filter(m => m.comision > 0).length
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <CreditCard className="text-blue-600" size={32} />
              Configuración de Métodos de Pago
            </h1>
            <p className="text-gray-600 mt-2">Gestiona los métodos de pago disponibles en el sistema</p>
          </div>
          <button
            onClick={() => abrirModal()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Agregar Método
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <CreditCard className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Métodos</p>
              <p className="text-2xl font-bold text-gray-800">{estadisticas.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <ToggleRight className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Activos</p>
              <p className="text-2xl font-bold text-green-600">{estadisticas.activos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-3 rounded-lg">
              <ToggleLeft className="text-red-600" size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Inactivos</p>
              <p className="text-2xl font-bold text-red-600">{estadisticas.inactivos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-3 rounded-lg">
              <DollarSign className="text-orange-600" size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Con Comisión</p>
              <p className="text-2xl font-bold text-orange-600">{estadisticas.conComision}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar métodos de pago..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFiltroActivo('todos')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filtroActivo === 'todos' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todos ({estadisticas.total})
            </button>
            <button
              onClick={() => setFiltroActivo('activos')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filtroActivo === 'activos' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Activos ({estadisticas.activos})
            </button>
            <button
              onClick={() => setFiltroActivo('inactivos')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filtroActivo === 'inactivos' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Inactivos ({estadisticas.inactivos})
            </button>
          </div>
        </div>
      </div>

      {/* Lista de métodos de pago */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {metodosFiltrados.length === 0 ? (
          <div className="p-8 text-center">
            <CreditCard className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay métodos de pago</h3>
            <p className="text-gray-500 mb-4">
              {busqueda ? 'No se encontraron métodos que coincidan con la búsqueda' : 'Aún no has agregado métodos de pago'}
            </p>
            <button
              onClick={() => abrirModal()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Agregar Primer Método
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comisión</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referencia</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Factura</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {metodosFiltrados.map((metodo) => (
                  <tr key={metodo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
                          style={{ backgroundColor: metodo.color }}
                        >
                          {metodo.icono}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{metodo.nombre}</div>
                          <div className="text-sm text-gray-500">{metodo.descripcion}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleActivo(metodo.id)}
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          metodo.activo 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {metodo.activo ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                        {metodo.activo ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        metodo.comision > 0 ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {metodo.comision}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        metodo.requiereReferencia ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {metodo.requiereReferencia ? 'Requerida' : 'No requerida'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        metodo.mostrarEnFactura ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {metodo.mostrarEnFactura ? 'Visible' : 'Oculto'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => abrirModal(metodo)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => eliminarMetodo(metodo.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para agregar/editar método */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {metodoEditando.id && metodosPago.find(m => m.id === metodoEditando.id) ? 'Editar' : 'Agregar'} Método de Pago
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información básica */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del método *
                    </label>
                    <input
                      type="text"
                      value={metodoEditando.nombre}
                      onChange={(e) => setMetodoEditando({...metodoEditando, nombre: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ej: Tarjeta de Crédito"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <input
                      type="text"
                      value={metodoEditando.descripcion}
                      onChange={(e) => setMetodoEditando({...metodoEditando, descripcion: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ej: Visa, Mastercard, American Express"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comisión (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={metodoEditando.comision}
                      onChange={(e) => setMetodoEditando({...metodoEditando, comision: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.0"
                    />
                  </div>
                </div>

                {/* Configuraciones */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Icono
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {iconosDisponibles.map((icono) => (
                        <button
                          key={icono.emoji}
                          onClick={() => setMetodoEditando({...metodoEditando, icono: icono.emoji})}
                          className={`p-3 rounded-lg border-2 text-xl hover:bg-gray-50 transition-colors ${
                            metodoEditando.icono === icono.emoji ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                          }`}
                          title={icono.nombre}
                        >
                          {icono.emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {coloresDisponibles.map((color) => (
                        <button
                          key={color}
                          onClick={() => setMetodoEditando({...metodoEditando, color})}
                          className={`w-12 h-12 rounded-lg border-2 transition-colors ${
                            metodoEditando.color === color ? 'border-gray-800' : 'border-gray-200'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={metodoEditando.activo}
                        onChange={(e) => setMetodoEditando({...metodoEditando, activo: e.target.checked})}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm font-medium text-gray-700">Método activo</span>
                    </label>

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={metodoEditando.requiereReferencia}
                        onChange={(e) => setMetodoEditando({...metodoEditando, requiereReferencia: e.target.checked})}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm font-medium text-gray-700">Requiere referencia</span>
                    </label>

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={metodoEditando.mostrarEnFactura}
                        onChange={(e) => setMetodoEditando({...metodoEditando, mostrarEnFactura: e.target.checked})}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm font-medium text-gray-700">Mostrar en factura</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Vista previa */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Vista previa:</h3>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
                    style={{ backgroundColor: metodoEditando.color }}
                  >
                    {metodoEditando.icono}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{metodoEditando.nombre || 'Nombre del método'}</div>
                    <div className="text-sm text-gray-500">{metodoEditando.descripcion || 'Descripción del método'}</div>
                  </div>
                  {metodoEditando.comision > 0 && (
                    <span className="ml-auto bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {metodoEditando.comision}%
                    </span>
                  )}
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarMetodo}
                  disabled={!metodoEditando.nombre}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <Save size={16} />
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfiguracionMetodosPago;