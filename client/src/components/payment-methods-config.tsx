import { useState } from "react";
import { Save, Plus, Edit2, Trash2, CreditCard, ToggleLeft, ToggleRight, DollarSign } from "lucide-react";
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

interface PaymentMethodsConfigProps {
  onNotification: (message: string) => void;
}

export default function PaymentMethodsConfig({ onNotification }: PaymentMethodsConfigProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState("all");

  const { data: paymentMethods = [], isLoading } = useQuery<PaymentMethod[]>({
    queryKey: ["/api/payment-methods"],
  });

  const form = useForm({
    resolver: zodResolver(insertPaymentMethodSchema),
    defaultValues: {
      name: "",
      icon: "💳",
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
    form.setValue("icon", method.icon);
    form.setValue("active", method.active);
    form.setValue("requiresReference", method.requiresReference);
    form.setValue("commission", method.commission);
    form.setValue("description", method.description || "");
    form.setValue("showOnInvoice", method.showOnInvoice);
    form.setValue("color", method.color);
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
                         (method.description && method.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterActive === "all" || 
                         (filterActive === "active" && method.active) ||
                         (filterActive === "inactive" && !method.active);
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: paymentMethods.length,
    active: paymentMethods.filter(m => m.active).length,
    inactive: paymentMethods.filter(m => !m.active).length,
    withCommission: paymentMethods.filter(m => parseFloat(m.commission) > 0).length
  };

  const iconOptions = [
    "💵", "💳", "🏧", "🏦", "📱", "💰", "🎫", "🔗", "⚡", "🌐"
  ];

  const colorOptions = [
    "#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", 
    "#EF4444", "#6B7280", "#EC4899", "#14B8A6"
  ];

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl dark:shadow-sm border border-border p-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Cargando métodos de pago...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card rounded-xl dark:shadow-sm border border-border p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-card-foreground flex items-center gap-3">
              <CreditCard className="text-secondary" size={32} />
              Configuración de Métodos de Pago
            </h1>
            <p className="text-muted-foreground mt-2">Gestiona los métodos de pago disponibles en el sistema</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                data-testid="button-add-payment-method"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Método
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
                      {iconOptions.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => form.setValue("icon", icon)}
                          className={`p-2 rounded border text-lg ${
                            form.watch("icon") === icon ? "border-secondary bg-secondary/10" : "border-border"
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
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
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-lg dark:shadow-sm border border-border">
          <div className="flex items-center gap-3">
            <div className="bg-secondary/10 p-3 rounded-lg">
              <CreditCard className="text-secondary" size={24} />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Total Métodos</p>
              <p className="text-2xl font-bold text-card-foreground">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg dark:shadow-sm border border-border">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
              <ToggleRight className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Activos</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg dark:shadow-sm border border-border">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-lg">
              <ToggleLeft className="text-red-600" size={24} />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Inactivos</p>
              <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg dark:shadow-sm border border-border">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 dark:bg-orange-900/20 p-3 rounded-lg">
              <DollarSign className="text-orange-600" size={24} />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Con Comisión</p>
              <p className="text-2xl font-bold text-orange-600">{stats.withCommission}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg dark:shadow-sm border border-border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Buscar métodos de pago..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="input-search-methods"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setFilterActive("all")}
              variant={filterActive === "all" ? "default" : "outline"}
              size="sm"
            >
              Todos ({stats.total})
            </Button>
            <Button
              onClick={() => setFilterActive("active")}
              variant={filterActive === "active" ? "default" : "outline"}
              size="sm"
            >
              Activos ({stats.active})
            </Button>
            <Button
              onClick={() => setFilterActive("inactive")}
              variant={filterActive === "inactive" ? "default" : "outline"}
              size="sm"
            >
              Inactivos ({stats.inactive})
            </Button>
          </div>
        </div>
      </div>

      {/* Payment Methods List */}
      <div className="bg-card rounded-lg dark:shadow-sm border border-border overflow-hidden">
        {filteredMethods.length === 0 ? (
          <div className="p-8 text-center">
            <CreditCard className="mx-auto text-muted-foreground mb-4" size={64} />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">No hay métodos de pago</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "No se encontraron métodos que coincidan con la búsqueda" : "Aún no has agregado métodos de pago"}
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              Agregar Primer Método
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Método</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Estado</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Comisión</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Referencia</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMethods.map((method) => (
                  <tr key={method.id} className="hover:bg-muted/50 transition-colors" data-testid={`method-row-${method.id}`}>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
                          style={{ backgroundColor: method.color }}
                        >
                          {method.icon}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-card-foreground">{method.name}</div>
                          <div className="text-sm text-muted-foreground">{method.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleToggleActive(method.id, method.active)}
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          method.active 
                            ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/30" 
                            : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/30"
                        }`}
                        data-testid={`toggle-status-${method.id}`}
                      >
                        {method.active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                        {method.active ? "Activo" : "Inactivo"}
                      </button>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        parseFloat(method.commission) > 0 ? "bg-orange-100 text-orange-800" : "bg-green-100 text-green-800"
                      }`}>
                        {method.commission}%
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-xs ${method.requiresReference ? "text-orange-600" : "text-green-600"}`}>
                        {method.requiresReference ? "Requiere" : "No requiere"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => handleEdit(method)}
                          variant="ghost"
                          size="sm"
                          data-testid={`button-edit-${method.id}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(method.id)}
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          data-testid={`button-delete-${method.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}