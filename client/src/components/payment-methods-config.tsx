import { useState } from "react";
import { Save, Plus, Edit2, Trash2, CreditCard, ToggleLeft, ToggleRight, DollarSign, Search, Filter, Sparkles, TrendingUp, Wallet, Smartphone, Building, Coins, Zap, Globe, Package, X } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type PaymentMethod, insertPaymentMethodSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PaymentMethodsConfigProps {
  onNotification: (message: string) => void;
}

export default function PaymentMethodsConfig({ onNotification }: PaymentMethodsConfigProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const { data: paymentMethods = [], isLoading } = useQuery<PaymentMethod[]>({
    queryKey: ["/api/payment-methods"],
  });

  const form = useForm({
    resolver: zodResolver(insertPaymentMethodSchema),
    defaultValues: {
      name: "",
      icon: "card",
      active: true,
      requiresReference: false,
      commission: "0",
      description: "",
      showOnInvoice: true,
      color: "#3B82F6",
    },
  });

  const createMethodMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingMethod) {
        const response = await apiRequest("PUT", `/api/payment-methods/${editingMethod.id}`, data);
        return response.json();
      } else {
        const response = await apiRequest("POST", "/api/payment-methods", data);
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-methods"] });
      onNotification(editingMethod ? "Método de pago actualizado exitosamente" : "Método de pago creado exitosamente");
      setIsDialogOpen(false);
      setEditingMethod(null);
      form.reset();
    },
    onError: () => {
      onNotification("Error al guardar el método de pago");
    },
  });

  const toggleMethodMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const response = await apiRequest("PUT", `/api/payment-methods/${id}`, { active });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-methods"] });
      onNotification("Estado del método de pago actualizado");
    },
  });

  const deleteMethodMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/payment-methods/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-methods"] });
      onNotification("Método de pago eliminado exitosamente");
    },
  });

  const handleSubmit = (data: any) => {
    createMethodMutation.mutate(data);
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    form.setValue("name", method.name);
    form.setValue("icon", method.icon || "card");
    form.setValue("active", method.active ?? true);
    form.setValue("requiresReference", method.requiresReference ?? false);
    form.setValue("commission", method.commission || "0");
    form.setValue("description", method.description || "");
    form.setValue("showOnInvoice", method.showOnInvoice ?? true);
    form.setValue("color", method.color || "#3B82F6");
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingMethod(null);
    form.reset();
  };

  const handleToggleActive = (id: string, currentActive: boolean) => {
    toggleMethodMutation.mutate({ id, active: !currentActive });
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Está seguro de eliminar este método de pago?")) {
      deleteMethodMutation.mutate(id);
    }
  };

  const filteredMethods = paymentMethods.filter(method => {
    const matchesSearch = method.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (method.description ?? "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterActive === "all" || 
                         (filterActive === "active" && method.active) ||
                         (filterActive === "inactive" && !method.active);
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: paymentMethods.length,
    active: paymentMethods.filter(m => m.active).length,
    inactive: paymentMethods.filter(m => !m.active).length,
    withCommission: paymentMethods.filter(m => parseFloat(m.commission ?? "0") > 0).length
  };

  const iconOptions = [
    { id: "card", icon: CreditCard, label: "Tarjeta" },
    { id: "cash", icon: Coins, label: "Efectivo" },
    { id: "bank", icon: Building, label: "Banco" },
    { id: "mobile", icon: Smartphone, label: "Móvil" },
    { id: "wallet", icon: Wallet, label: "Billetera" },
    { id: "zap", icon: Zap, label: "Rápido" },
    { id: "globe", icon: Globe, label: "Online" },
    { id: "package", icon: Package, label: "Paquete" },
    { id: "sparkles", icon: Sparkles, label: "Premium" },
    { id: "trending", icon: TrendingUp, label: "Trending" }
  ];
  
  const getIconComponent = (iconId: string) => {
    const option = iconOptions.find(opt => opt.id === iconId);
    return option ? option.icon : CreditCard;
  };

  const colorOptions = [
    "#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", 
    "#EF4444", "#6B7280", "#EC4899", "#14B8A6"
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="tech-button-3d bg-white dark:bg-gray-800/50 border-2 border-cyan-300 dark:border-cyan-500/30 rounded-xl shadow-sm dark:backdrop-blur-sm">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center mx-auto tech-glow animate-pulse">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <p className="text-gray-600 dark:text-gray-400">Cargando métodos de pago...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas y botón crear */}
      <Card className="tech-button-3d bg-white dark:bg-gray-800/50 border-2 border-cyan-300 dark:border-cyan-500/30 rounded-xl shadow-sm dark:backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center tech-glow">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold text-gray-800 dark:text-white">Gestión de Métodos de Pago</CardTitle>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Configura métodos de pago personalizados</p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => {
                    setEditingMethod(null);
                    setIsDialogOpen(true);
                  }}
                  className="tech-button-3d bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 text-green-700 dark:bg-gradient-to-br dark:from-green-500/20 dark:to-emerald-600/20 dark:text-green-300 dark:border-green-500/30 hover:from-green-100 hover:to-emerald-100 hover:border-green-400 dark:hover:from-green-400/30 dark:hover:to-emerald-500/30 transition-all duration-300 transform hover:scale-105 tech-glow px-6 py-3"
                  data-testid="button-add-payment-method"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Crear Método
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingMethod ? "Editar Método de Pago" : "Nuevo Método de Pago"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    {...form.register("name")}
                    placeholder="Ej: Tarjeta de Débito"
                    data-testid="input-method-name"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="icon">Ícono</Label>
                    <div className="grid grid-cols-5 gap-2 mt-2">
                      {iconOptions.map((option) => {
                        const IconComponent = option.icon;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => form.setValue("icon", option.id)}
                            className={`p-2 rounded border ${
                              form.watch("icon") === option.id ? "border-secondary bg-secondary/10" : "border-border"
                            }`}
                            title={option.label}
                          >
                            <IconComponent className="w-4 h-4" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="color">Color</Label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => form.setValue("color", color)}
                          className={`w-8 h-8 rounded border-2 ${
                            form.watch("color") === color ? "border-gray-800 dark:border-gray-200" : "border-gray-300 dark:border-gray-600"
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Input
                    id="description"
                    {...form.register("description")}
                    placeholder="Descripción del método de pago"
                  />
                </div>

                <div>
                  <Label htmlFor="commission">Comisión (%)</Label>
                  <Input
                    id="commission"
                    type="number"
                    step="0.1"
                    {...form.register("commission")}
                    placeholder="0.0"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="active">Activo</Label>
                    <Switch
                      id="active"
                      checked={form.watch("active")}
                      onCheckedChange={(checked) => form.setValue("active", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="requiresReference">Requiere Referencia</Label>
                    <Switch
                      id="requiresReference"
                      checked={form.watch("requiresReference")}
                      onCheckedChange={(checked) => form.setValue("requiresReference", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showOnInvoice">Mostrar en Factura</Label>
                    <Switch
                      id="showOnInvoice"
                      checked={form.watch("showOnInvoice")}
                      onCheckedChange={(checked) => form.setValue("showOnInvoice", checked)}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDialogClose}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMethodMutation.isPending}
                    className="flex-1"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {createMethodMutation.isPending ? "Guardando..." : "Guardar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </CardHeader>
        
        {/* Estadísticas */}
        {paymentMethods.length > 0 && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="tech-button-3d bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 dark:border-blue-500/30 rounded-xl p-4 text-center">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.total}</p>
                <p className="text-sm text-blue-600 dark:text-blue-400">Total Métodos</p>
              </div>
              <div className="tech-button-3d bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 dark:border-green-500/30 rounded-xl p-4 text-center">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <ToggleRight className="w-4 h-4 text-white" />
                </div>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.active}</p>
                <p className="text-sm text-green-600 dark:text-green-400">Activos</p>
              </div>
              <div className="tech-button-3d bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-300 dark:border-red-500/30 rounded-xl p-4 text-center">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <ToggleLeft className="w-4 h-4 text-white" />
                </div>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.inactive}</p>
                <p className="text-sm text-red-600 dark:text-red-400">Inactivos</p>
              </div>
              <div className="tech-button-3d bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-300 dark:border-orange-500/30 rounded-xl p-4 text-center">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{stats.withCommission}</p>
                <p className="text-sm text-orange-600 dark:text-orange-400">Con Comisión</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
      
      {/* Buscador y filtros */}
      <Card className="tech-button-3d bg-white dark:bg-gray-800/50 border-2 border-gray-300 dark:border-gray-500/30 rounded-xl shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar métodos de pago..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-2 border-gray-300 dark:border-gray-600 focus:border-cyan-400 dark:focus:border-cyan-400"
                data-testid="input-search-methods"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setFilterActive("all")}
                variant={filterActive === "all" ? "default" : "outline"}
                size="sm"
                className="tech-button-3d border-2 border-gray-300 hover:border-gray-400"
              >
                Todos ({stats.total})
              </Button>
              <Button
                onClick={() => setFilterActive("active")}
                variant={filterActive === "active" ? "default" : "outline"}
                size="sm"
                className="tech-button-3d border-2 border-gray-300 hover:border-gray-400"
              >
                Activos ({stats.active})
              </Button>
              <Button
                onClick={() => setFilterActive("inactive")}
                variant={filterActive === "inactive" ? "default" : "outline"}
                size="sm"
                className="tech-button-3d border-2 border-gray-300 hover:border-gray-400"
              >
                Inactivos ({stats.inactive})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Lista de métodos */}
      <div className="grid gap-4">
        {filteredMethods.map((method) => (
          <Card key={method.id} className="tech-button-3d bg-white dark:bg-gray-800/50 border-2 border-blue-300 dark:border-blue-500/30 rounded-xl shadow-sm hover:shadow-lg hover:border-blue-400 dark:hover:border-blue-400 transition-all duration-300 dark:backdrop-blur-sm" data-testid={`method-row-${method.id}`}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white tech-glow"
                    style={{ backgroundColor: method.color ?? "#3B82F6" }}
                  >
                    {(() => {
                      const IconComponent = getIconComponent(method.icon ?? "card");
                      return <IconComponent className="w-5 h-5" />;
                    })()}
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-blue-700 dark:text-blue-300">
                      {method.name}
                    </CardTitle>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                      {method.description ?? "Método de pago"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(method.id, method.active ?? false)}
                    className={`tech-button-3d border-2 ${method.active 
                      ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 text-green-700 hover:from-green-100 hover:to-emerald-100" 
                      : "bg-gradient-to-br from-red-50 to-pink-50 border-red-300 text-red-700 hover:from-red-100 hover:to-pink-100"} transition-all duration-300 transform hover:scale-105`}
                    data-testid={`toggle-status-${method.id}`}
                  >
                    {method.active ? <ToggleRight className="w-4 h-4 mr-1" /> : <ToggleLeft className="w-4 h-4 mr-1" />}
                    {method.active ? "Activo" : "Inactivo"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(method)}
                    className="tech-button-3d bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-300 text-cyan-700 hover:from-cyan-100 hover:to-blue-100 transition-all duration-300 transform hover:scale-105"
                    data-testid={`button-edit-${method.id}`}
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(method.id)}
                    className="tech-button-3d bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-300 text-red-700 hover:from-red-100 hover:to-pink-100 transition-all duration-300 transform hover:scale-105"
                    data-testid={`button-delete-${method.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="tech-button-3d bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-300 dark:border-orange-500/30 rounded-xl p-4 text-center hover:from-orange-100 hover:to-amber-100 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-sm text-orange-600 dark:text-orange-400 mb-1 font-medium">Comisión</p>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                    {method.commission ?? "0"}%
                  </p>
                </div>
                <div className="tech-button-3d bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 dark:border-purple-500/30 rounded-xl p-4 text-center hover:from-purple-100 hover:to-pink-100 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-sm text-purple-600 dark:text-purple-400 mb-1 font-medium">Referencia</p>
                  <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                    {method.requiresReference ? "Requiere" : "No Requiere"}
                  </p>
                </div>
                <div className="tech-button-3d bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 dark:border-green-500/30 rounded-xl p-4 text-center hover:from-green-100 hover:to-emerald-100 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Package className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400 mb-1 font-medium">En Factura</p>
                  <p className="text-lg font-bold text-green-700 dark:text-green-300">
                    {method.showOnInvoice ? "Sí" : "No"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estado vacío mejorado */}
      {filteredMethods.length === 0 && (
        <Card className="tech-button-3d bg-white dark:bg-gray-800/50 border-2 border-gray-300 dark:border-gray-500/30 rounded-xl shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl flex items-center justify-center tech-glow">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">No hay métodos de pago</h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                {searchTerm ? "No se encontraron métodos que coincidan con la búsqueda" : "Comienza creando tu primer método de pago con configuración personalizada."}
              </p>
            </div>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="tech-button-3d bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-300 text-cyan-700 hover:from-cyan-100 hover:to-blue-100 transition-all duration-300 transform hover:scale-105 tech-glow px-6 py-3"
            >
              <Plus className="w-5 h-5 mr-2" />
              Agregar Primer Método
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}