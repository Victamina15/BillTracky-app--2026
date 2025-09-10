import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  Shield, 
  Key, 
  User, 
  Crown, 
  UserCheck,
  Eye,
  EyeOff,
  Save,
  X,
  Check,
  AlertCircle,
  Settings,
  Lock,
  Unlock
} from 'lucide-react';

const SistemaRoles = () => {
  const [employees, setEmployees] = useState([
    { 
      id: 1, 
      nombre: 'Juan Carlos', 
      puesto: 'Gerente General', 
      codigoAcceso: '1234', 
      rol: 'gerente',
      activo: true,
      fechaCreacion: '2024-01-15',
      ultimoAcceso: '2024-09-04'
    },
    { 
      id: 2, 
      nombre: 'María Fernández', 
      puesto: 'Operadora Principal', 
      codigoAcceso: '5678', 
      rol: 'empleado',
      activo: true,
      fechaCreacion: '2024-02-20',
      ultimoAcceso: '2024-09-03'
    },
    { 
      id: 3, 
      nombre: 'Pedro González', 
      puesto: 'Supervisor de Turno', 
      codigoAcceso: '9999', 
      rol: 'supervisor',
      activo: true,
      fechaCreacion: '2024-03-10',
      ultimoAcceso: '2024-09-02'
    },
    { 
      id: 4, 
      nombre: 'Ana López', 
      puesto: 'Cajera', 
      codigoAcceso: '4567', 
      rol: 'empleado',
      activo: false,
      fechaCreacion: '2024-01-20',
      ultimoAcceso: '2024-08-28'
    }
  ]);

  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showRolePermissionsModal, setShowRolePermissionsModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [modalMessage, setModalMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showPassword, setShowPassword] = useState({});

  const [empleadoForm, setEmpleadoForm] = useState({
    nombre: '',
    puesto: '',
    codigoAcceso: '',
    rol: 'empleado'
  });

  const roles = {
    gerente: {
      nombre: 'Gerente',
      color: 'blue',
      icon: Crown,
      permisos: [
        'Crear y editar facturas',
        'Cancelar órdenes',
        'Ver cierre de caja',
        'Gestionar empleados',
        'Configurar servicios',
        'Acceso a reportes completos',
        'Gestionar métodos de pago',
        'Configuración del sistema'
      ]
    },
    supervisor: {
      nombre: 'Supervisor',
      color: 'purple',
      icon: Shield,
      permisos: [
        'Crear y editar facturas',
        'Cambiar estados de órdenes',
        'Ver cierre de caja',
        'Gestionar servicios básicos',
        'Acceso a reportes básicos',
        'Cobrar pagos pendientes'
      ]
    },
    empleado: {
      nombre: 'Empleado',
      color: 'green',
      icon: User,
      permisos: [
        'Crear facturas básicas',
        'Ver órdenes asignadas',
        'Cambiar estados básicos',
        'Cobrar pagos'
      ]
    }
  };

  const empleadoLogueado = {
    nombre: 'Juan Carlos',
    rol: 'gerente'
  };

  const openModal = (message) => {
    setModalMessage(message);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalMessage('');
  };

  const generateRandomCode = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const openEmployeeModal = (employee = null) => {
    if (employee) {
      setSelectedEmployee(employee);
      setEmpleadoForm({
        nombre: employee.nombre,
        puesto: employee.puesto,
        codigoAcceso: employee.codigoAcceso,
        rol: employee.rol
      });
    } else {
      setSelectedEmployee(null);
      setEmpleadoForm({
        nombre: '',
        puesto: '',
        codigoAcceso: generateRandomCode(),
        rol: 'empleado'
      });
    }
    setShowEmployeeModal(true);
  };

  const saveEmployee = () => {
    if (!empleadoForm.nombre || !empleadoForm.puesto || !empleadoForm.codigoAcceso) {
      openModal("Complete todos los campos obligatorios.");
      return;
    }

    const existingEmployee = employees.find(emp => 
      emp.codigoAcceso === empleadoForm.codigoAcceso && 
      emp.id !== selectedEmployee?.id
    );

    if (existingEmployee) {
      openModal("El código de acceso ya está en uso. Genere uno nuevo.");
      return;
    }

    if (selectedEmployee) {
      setEmployees(employees.map(emp => 
        emp.id === selectedEmployee.id 
          ? { ...emp, ...empleadoForm }
          : emp
      ));
      openModal("Empleado actualizado exitosamente.");
    } else {
      const newEmployee = {
        id: employees.length + 1,
        ...empleadoForm,
        activo: true,
        fechaCreacion: new Date().toISOString().split('T')[0],
        ultimoAcceso: 'Nunca'
      };
      setEmployees([...employees, newEmployee]);
      openModal("Empleado creado exitosamente.");
    }

    setShowEmployeeModal(false);
    setSelectedEmployee(null);
  };

  const toggleEmployeeStatus = (employeeId) => {
    setEmployees(employees.map(emp => 
      emp.id === employeeId 
        ? { ...emp, activo: !emp.activo }
        : emp
    ));
    
    const employee = employees.find(emp => emp.id === employeeId);
    openModal(`Empleado ${employee.activo ? 'desactivado' : 'activado'} exitosamente.`);
  };

  const deleteEmployee = () => {
    if (!employeeToDelete) return;
    
    setEmployees(employees.filter(emp => emp.id !== employeeToDelete.id));
    openModal("Empleado eliminado exitosamente.");
    setShowDeleteConfirmModal(false);
    setEmployeeToDelete(null);
  };

  const togglePasswordVisibility = (employeeId) => {
    setShowPassword(prev => ({
      ...prev,
      [employeeId]: !prev[employeeId]
    }));
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.puesto.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || employee.rol === filterRole;
    return matchesSearch && matchesRole;
  });

  const Modal = () => {
    if (!isModalOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sistema de Roles</h3>
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

  const EmployeeModal = () => {
    if (!showEmployeeModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {selectedEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}
            </h3>
            <button
              onClick={() => setShowEmployeeModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo *</label>
              <input
                type="text"
                value={empleadoForm.nombre}
                onChange={(e) => setEmpleadoForm({...empleadoForm, nombre: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Juan Pérez"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Puesto de Trabajo *</label>
              <input
                type="text"
                value={empleadoForm.puesto}
                onChange={(e) => setEmpleadoForm({...empleadoForm, puesto: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Cajero Principal"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Código de Acceso *</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={empleadoForm.codigoAcceso}
                  onChange={(e) => setEmpleadoForm({...empleadoForm, codigoAcceso: e.target.value})}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Código de 4 dígitos"
                  maxLength={4}
                />
                <button
                  onClick={() => setEmpleadoForm({...empleadoForm, codigoAcceso: generateRandomCode()})}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
                  title="Generar código aleatorio"
                >
                  <Key className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rol del Sistema *</label>
              <select
                value={empleadoForm.rol}
                onChange={(e) => setEmpleadoForm({...empleadoForm, rol: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(roles).map(([key, role]) => (
                  <option key={key} value={key}>
                    {role.nombre}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Permisos del Rol:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {roles[empleadoForm.rol]?.permisos.map((permiso, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="w-3 h-3 text-green-600 mr-2" />
                    {permiso}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="flex space-x-3 mt-6">
            <button
              onClick={() => setShowEmployeeModal(false)}
              className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={saveEmployee}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              {selectedEmployee ? 'Actualizar' : 'Crear'} Empleado
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Eliminar Empleado</h3>
            <p className="text-gray-600 mb-6">
              ¿Está seguro que desea eliminar a <strong>{employeeToDelete?.nombre}</strong>? 
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
                onClick={deleteEmployee}
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

  const RolePermissionsModal = () => {
    if (!showRolePermissionsModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Permisos por Rol</h3>
            <button
              onClick={() => setShowRolePermissionsModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-6">
            {Object.entries(roles).map(([key, role]) => {
              const IconComponent = role.icon;
              return (
                <div key={key} className="border rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <IconComponent className="w-5 h-5 text-blue-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">{role.nombre}</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {role.permisos.map((permiso, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <Check className="w-3 h-3 text-green-600 mr-2" />
                        {permiso}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Empleados</h1>
                <p className="text-gray-600">Sistema de roles y permisos</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowRolePermissionsModal(true)}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 font-medium flex items-center space-x-2"
              >
                <Shield className="w-4 h-4" />
                <span>Ver Permisos</span>
              </button>
              <button
                onClick={() => openEmployeeModal()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Nuevo Empleado</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Users className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar empleado por nombre o puesto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los roles</option>
                {Object.entries(roles).map(([key, role]) => (
                  <option key={key} value={key}>{role.nombre}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empleado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Último Acceso</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEmployees.map((employee) => {
                  const role = roles[employee.rol];
                  const IconComponent = role?.icon || User;
                  
                  return (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <IconComponent className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{employee.nombre}</p>
                            <p className="text-sm text-gray-500">{employee.puesto}</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {role?.nombre}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                            {showPassword[employee.id] ? employee.codigoAcceso : '••••'}
                          </code>
                          <button
                            onClick={() => togglePasswordVisibility(employee.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {showPassword[employee.id] ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {employee.activo ? (
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                              <span className="text-green-700 text-sm font-medium">Activo</span>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                              <span className="text-red-700 text-sm font-medium">Inactivo</span>
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {employee.ultimoAcceso === 'Nunca' ? 'Nunca' : new Date(employee.ultimoAcceso).toLocaleDateString()}
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openEmployeeModal(employee)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Editar empleado"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => toggleEmployeeStatus(employee.id)}
                            className={`${employee.activo ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                            title={employee.activo ? 'Desactivar' : 'Activar'}
                          >
                            {employee.activo ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </button>
                          
                          {empleadoLogueado.rol === 'gerente' && employee.id !== 1 && (
                            <button
                              onClick={() => {
                                setEmployeeToDelete(employee);
                                setShowDeleteConfirmModal(true);
                              }}
                              className="text-red-600 hover:text-red-900"
                              title="Eliminar empleado"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Empleados</p>
                <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Activos</p>
                <p className="text-2xl font-bold text-gray-900">{employees.filter(e => e.activo).length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Crown className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Gerentes</p>
                <p className="text-2xl font-bold text-gray-900">{employees.filter(e => e.rol === 'gerente').length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Supervisores</p>
                <p className="text-2xl font-bold text-gray-900">{employees.filter(e => e.rol === 'supervisor').length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal />
      <EmployeeModal />
      <DeleteConfirmModal />
      <RolePermissionsModal />
    </div>
  );
};

export default SistemaRoles;