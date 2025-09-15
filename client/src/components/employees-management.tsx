import { useState } from "react";
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
  Unlock,
  Search,
  Filter
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Employee, insertEmployeeSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface EmployeesManagementProps {
  onNotification: (message: string) => void;
}

type EmployeeRole = 'manager' | 'supervisor' | 'employee';

const roles = {
  manager: {
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
  employee: {
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

export default function EmployeesManagement({ onNotification }: EmployeesManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | EmployeeRole>('all');
  const [showRolePermissionsModal, setShowRolePermissionsModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<EmployeeRole | null>(null);

  const { data: employees = [], isLoading } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const form = useForm({
    resolver: zodResolver(insertEmployeeSchema.extend({
      accessCode: z.string().min(4, "El código debe tener al menos 4 dígitos").max(6, "El código no puede exceder 6 dígitos"),
    })),
    defaultValues: {
      name: "",
      position: "",
      accessCode: "",
      role: "employee" as EmployeeRole,
    },
  });

  const createEmployeeMutation = useMutation({
    mutationFn: async (data: any) => {
      const method = editingEmployee ? "PUT" : "POST";
      const url = editingEmployee ? `/api/employees/${editingEmployee.id}` : "/api/employees";
      const response = await apiRequest(method, url, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      const message = editingEmployee ? "Empleado actualizado exitosamente" : "Empleado creado exitosamente";
      onNotification(message);
      setIsDialogOpen(false);
      setEditingEmployee(null);
      form.reset();
    },
    onError: () => {
      const message = editingEmployee ? "Error al actualizar el empleado" : "Error al crear el empleado";
      onNotification(message);
    },
  });

  const toggleEmployeeStatusMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const response = await apiRequest("PATCH", `/api/employees/${id}`, { active });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      onNotification("Estado del empleado actualizado exitosamente");
    },
    onError: () => {
      onNotification("Error al actualizar el estado del empleado");
    },
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/employees/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      onNotification("Empleado eliminado exitosamente");
    },
    onError: () => {
      onNotification("Error al eliminar el empleado");
    },
  });

  const generateRandomCode = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    form.setValue("name", employee.name);
    form.setValue("position", employee.position);
    // Don't set access code when editing - it's now hashed and hidden
    form.setValue("accessCode", "");
    form.setValue("role", employee.role as EmployeeRole);
    setIsDialogOpen(true);
  };

  const handleSubmit = (data: any) => {
    createEmployeeMutation.mutate(data);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingEmployee(null);
    form.reset();
  };

  const handleNewEmployee = () => {
    form.setValue("accessCode", generateRandomCode());
    setIsDialogOpen(true);
  };

  const toggleEmployeeStatus = (employee: Employee) => {
    toggleEmployeeStatusMutation.mutate({
      id: employee.id,
      active: !employee.active
    });
  };

  const handleDeleteEmployee = (employee: Employee) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar a ${employee.name}?`)) {
      deleteEmployeeMutation.mutate(employee.id);
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchTerm.toLowerCase());
                         // Removed access code from search since it's now hashed and hidden
    
    const matchesRole = filterRole === 'all' || employee.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: string): string => {
    switch (role) {
      case 'manager': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      case 'supervisor': return 'bg-gradient-to-r from-purple-400 to-pink-500 text-white';
      case 'employee': return 'bg-gradient-to-r from-green-400 to-emerald-500 text-white';
      default: return 'bg-gradient-to-r from-slate-400 to-slate-500 text-white';
    }
  };

  const getRoleName = (role: string): string => {
    switch (role) {
      case 'manager': return 'Gerente';
      case 'supervisor': return 'Supervisor';
      case 'employee': return 'Empleado';
      default: return role;
    }
  };

  // Calculate statistics
  const stats = {
    total: employees.length,
    active: employees.filter(e => e.active).length,
    managers: employees.filter(e => e.role === 'manager').length,
    supervisors: employees.filter(e => e.role === 'supervisor').length,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="tech-glow border-2 border-slate-300/50 dark:border-cyan-500/30">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="tech-glow border-2 border-slate-300/50 dark:border-cyan-500/30">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground dark:text-gray-300">👥 Cargando empleados...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Tech-3D Styling */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tech-text-glow bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            👥 Gestión de Empleados
          </h1>
          <p className="tech3d-text-muted">Administra roles, permisos y accesos del personal</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setSelectedRole('manager');
              setShowRolePermissionsModal(true);
            }}
            className="tech3d-button px-4 py-2 text-sm flex items-center space-x-2"
            data-testid="button-view-permissions"
          >
            <Settings className="w-4 h-4" />
            <span>🔐 Ver Permisos</span>
          </button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button 
                onClick={handleNewEmployee}
                className="tech3d-button px-6 py-3 text-sm flex items-center space-x-2"
                data-testid="button-add-employee"
              >
                <Plus className="w-5 h-5" />
                <span>➕ Nuevo Empleado</span>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingEmployee ? "✏️ Editar Empleado" : "➕ Nuevo Empleado"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    {...form.register("name")}
                    placeholder="Nombre completo del empleado"
                    data-testid="input-employee-name"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="position">Puesto</Label>
                  <Input
                    id="position"
                    {...form.register("position")}
                    placeholder="Ej: Operador, Cajero, Supervisor"
                    data-testid="input-employee-position"
                  />
                  {form.formState.errors.position && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.position.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="accessCode">
                    {editingEmployee ? "Nuevo Código de Acceso (opcional)" : "Código de Acceso"}
                  </Label>
                  {editingEmployee ? (
                    <div className="space-y-2">
                      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border">
                        <p className="text-sm text-muted-foreground">
                          🔒 Código actual: <span className="font-mono">***PROTEGIDO***</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Por seguridad, los códigos están encriptados. Deja vacío para mantener el actual o genera uno nuevo.
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Input
                          id="accessCode"
                          {...form.register("accessCode")}
                          placeholder="Dejar vacío para mantener actual"
                          type="number"
                          data-testid="input-employee-access-code"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => form.setValue("accessCode", generateRandomCode())}
                          className="tech-button-3d border-2 border-slate-300 hover:border-cyan-400"
                          title="Generar nuevo código"
                        >
                          🎲
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <Input
                        id="accessCode"
                        {...form.register("accessCode")}
                        placeholder="1234"
                        type="number"
                        data-testid="input-employee-access-code"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => form.setValue("accessCode", generateRandomCode())}
                        className="tech-button-3d border-2 border-slate-300 hover:border-cyan-400"
                        title="Generar código aleatorio"
                      >
                        🎲
                      </Button>
                    </div>
                  )}
                  {form.formState.errors.accessCode && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.accessCode.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="role">Rol</Label>
                  <Select 
                    value={form.watch("role")} 
                    onValueChange={(value: EmployeeRole) => form.setValue("role", value)}
                  >
                    <SelectTrigger className="tech-glow border-2 border-slate-300/50" data-testid="select-role">
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">👤 Empleado</SelectItem>
                      <SelectItem value="supervisor">🛡️ Supervisor</SelectItem>
                      <SelectItem value="manager">👑 Gerente</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.role && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.role.message}
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={createEmployeeMutation.isPending}
                    className="tech-button-3d bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 border-2 border-cyan-300 shadow-lg tech-glow flex-1"
                    data-testid="button-save-employee"
                  >
                    {createEmployeeMutation.isPending ? "💾 Guardando..." : "💾 Guardar"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDialogClose}
                    className="tech-button-3d border-2 border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    data-testid="button-cancel"
                  >
                    ❌ Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="tech-glow border-2 border-slate-300/50 dark:border-cyan-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-blue-600 dark:text-cyan-400">{stats.total}</CardTitle>
                <CardDescription>👥 Total Empleados</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="tech-glow border-2 border-slate-300/50 dark:border-green-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</CardTitle>
                <CardDescription>✅ Empleados Activos</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="tech-glow border-2 border-slate-300/50 dark:border-yellow-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.managers}</CardTitle>
                <CardDescription>👑 Gerentes</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="tech-glow border-2 border-slate-300/50 dark:border-purple-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.supervisors}</CardTitle>
                <CardDescription>🛡️ Supervisores</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="tech-glow border-2 border-slate-300/50 dark:border-cyan-500/30">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="🔍 Buscar por nombre o puesto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 tech-glow border-2 border-slate-300/50 focus:border-cyan-500/50"
                data-testid="input-search-employees"
              />
            </div>
            <div className="flex items-center space-x-4">
              <Select value={filterRole} onValueChange={(value: 'all' | EmployeeRole) => setFilterRole(value)}>
                <SelectTrigger className="w-48 tech-glow border-2 border-slate-300/50" data-testid="select-role-filter">
                  <SelectValue placeholder="Filtrar por rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">🌟 Todos los Roles</SelectItem>
                  <SelectItem value="manager">👑 Gerentes</SelectItem>
                  <SelectItem value="supervisor">🛡️ Supervisores</SelectItem>
                  <SelectItem value="employee">👤 Empleados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employees Table */}
      <Card className="tech-glow border-2 border-slate-300/50 dark:border-cyan-500/30">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">👤 Empleado</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">🏷️ Rol</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">🔑 Código</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">📊 Estado</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">📅 Último Acceso</th>
                  <th className="px-6 py-4 text-center font-semibold text-slate-700 dark:text-slate-300">⚙️ Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300" data-testid={`employee-row-${employee.id}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-400/20 to-purple-500/20 rounded-full flex items-center justify-center border-2 border-cyan-400/30">
                          <User className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground" data-testid={`employee-name-${employee.id}`}>
                            {employee.name}
                          </div>
                          <div className="text-sm text-muted-foreground" data-testid={`employee-position-${employee.id}`}>
                            {employee.position}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={`${getRoleColor(employee.role)} text-xs px-3 py-1`}>
                        {getRoleName(employee.role)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <code className="px-2 py-1 rounded text-sm font-mono bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-green-300 dark:border-green-700">
                          🔒 PROTEGIDO
                        </code>
                        <div className="text-xs text-muted-foreground" title="Los códigos están encriptados por seguridad">
                          <Lock className="w-3 h-3" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${employee.active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className={`text-sm font-medium ${employee.active ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                          {employee.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {employee.lastAccess ? new Date(employee.lastAccess).toLocaleDateString('es-DO') : 'Nunca'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleEdit(employee)}
                          className="tech-button-3d p-2 bg-gradient-to-r from-blue-400 to-blue-500 text-white hover:from-blue-500 hover:to-blue-600 rounded-lg border-2 border-blue-300 shadow-lg transition-all duration-300 hover:scale-110"
                          title="Editar empleado"
                          data-testid={`button-edit-employee-${employee.id}`}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleEmployeeStatus(employee)}
                          className={`tech-button-3d p-2 rounded-lg border-2 shadow-lg transition-all duration-300 hover:scale-110 ${
                            employee.active 
                              ? 'bg-gradient-to-r from-red-400 to-red-500 text-white hover:from-red-500 hover:to-red-600 border-red-300' 
                              : 'bg-gradient-to-r from-green-400 to-green-500 text-white hover:from-green-500 hover:to-green-600 border-green-300'
                          }`}
                          title={employee.active ? 'Desactivar' : 'Activar'}
                          data-testid={`button-toggle-employee-${employee.id}`}
                        >
                          {employee.active ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(employee)}
                          className="tech-button-3d p-2 bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 rounded-lg border-2 border-red-300 shadow-lg transition-all duration-300 hover:scale-110"
                          title="Eliminar empleado"
                          data-testid={`button-delete-employee-${employee.id}`}
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
        </CardContent>
      </Card>

      {filteredEmployees.length === 0 && (
        <Card className="tech-glow border-2 border-slate-300/50 dark:border-cyan-500/30">
          <CardContent className="p-12">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-12 h-12 text-slate-500 dark:text-slate-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">
                  {searchTerm || filterRole !== 'all' ? '🔍 No se encontraron empleados' : '👥 No hay empleados registrados'}
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm || filterRole !== 'all' 
                    ? 'Intenta ajustar tu búsqueda o filtros.' 
                    : 'Comienza agregando tu primer empleado al sistema.'
                  }
                </p>
              </div>
              {!searchTerm && filterRole === 'all' && (
                <Button 
                  onClick={handleNewEmployee}
                  className="tech-button-3d bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg font-bold border-2 border-green-300 shadow-lg tech-glow"
                  data-testid="button-add-first-employee"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  ➕ Agregar Primer Empleado
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Role Permissions Modal */}
      <Dialog open={showRolePermissionsModal} onOpenChange={setShowRolePermissionsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>🔐 Permisos por Rol</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {Object.entries(roles).map(([roleKey, roleData]) => {
              const IconComponent = roleData.icon;
              return (
                <div key={roleKey} className="border rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`w-10 h-10 ${roleData.color === 'blue' ? 'bg-blue-100' : roleData.color === 'purple' ? 'bg-purple-100' : 'bg-green-100'} rounded-lg flex items-center justify-center`}>
                      <IconComponent className={`w-5 h-5 ${roleData.color === 'blue' ? 'text-blue-600' : roleData.color === 'purple' ? 'text-purple-600' : 'text-green-600'}`} />
                    </div>
                    <h3 className="font-semibold text-lg">{roleData.nombre}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {roleData.permisos.map((permiso, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>{permiso}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}