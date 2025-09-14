import { useState } from "react";
import { Plus, Edit3, Save, Search, Sparkles, Package, TrendingUp, Filter, X, Trash2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Service, insertServiceSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ServicesConfigProps {
  onNotification: (message: string) => void;
}

export default function ServicesConfig({ onNotification }: ServicesConfigProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [serviceTypes, setServiceTypes] = useState([
    { id: `service_${Date.now()}`, name: "", price: "" }
  ]);

  const { data: services = [], isLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const form = useForm({
    resolver: zodResolver(insertServiceSchema),
    defaultValues: {
      name: "",
      washPrice: "",
      ironPrice: "",
      bothPrice: "",
    },
  });

  // Filtrar servicios
  const filteredServices = services.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Estadísticas
  const stats = {
    total: services.length,
    avgWashPrice: services.length > 0 ? services.reduce((sum, s) => sum + parseFloat(s.washPrice), 0) / services.length : 0,
    avgIronPrice: services.length > 0 ? services.reduce((sum, s) => sum + parseFloat(s.ironPrice), 0) / services.length : 0,
    maxPrice: services.length > 0 ? Math.max(...services.map(s => Math.max(parseFloat(s.washPrice), parseFloat(s.ironPrice), parseFloat(s.bothPrice)))) : 0
  };

  const addServiceType = () => {
    setServiceTypes([...serviceTypes, { id: `custom_${Date.now()}`, name: "", price: "" }]);
  };

  const removeServiceType = (id: string) => {
    if (serviceTypes.length > 1) {
      setServiceTypes(serviceTypes.filter(type => type.id !== id));
    }
  };

  const updateServiceType = (id: string, field: 'name' | 'price', value: string) => {
    setServiceTypes(serviceTypes.map(type => 
      type.id === id ? { ...type, [field]: value } : type
    ));
  };

  const createServiceMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingService) {
        const response = await apiRequest("PUT", `/api/services/${editingService.id}`, data);
        return response.json();
      } else {
        const response = await apiRequest("POST", "/api/services", data);
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      onNotification(editingService ? "Servicio actualizado exitosamente" : "Servicio creado exitosamente");
      setIsDialogOpen(false);
      setEditingService(null);
      form.reset();
    },
    onError: () => {
      onNotification("Error al guardar el servicio");
    },
  });

  const handleSubmit = (data: any) => {
    // Construir datos del servicio con tipos personalizados
    const serviceData = {
      name: data.name,
      // Usar el primer tipo para compatibilidad o valores por defecto
      washPrice: serviceTypes[0]?.price || "0",
      ironPrice: serviceTypes[1]?.price || "0", 
      bothPrice: serviceTypes[2]?.price || "0",
      // Guardar tipos personalizados para uso futuro
      customTypes: serviceTypes.filter(type => type.name && type.price)
    };
    createServiceMutation.mutate(serviceData);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    form.setValue("name", service.name);
    form.setValue("washPrice", service.washPrice);
    form.setValue("ironPrice", service.ironPrice);
    form.setValue("bothPrice", service.bothPrice);
    
    // Cargar tipos de servicio desde el servicio existente
    const existingTypes = [];
    if (service.washPrice && parseFloat(service.washPrice) > 0) {
      existingTypes.push({ id: `wash_${Date.now()}`, name: "Solo Lavado", price: service.washPrice });
    }
    if (service.ironPrice && parseFloat(service.ironPrice) > 0) {
      existingTypes.push({ id: `iron_${Date.now()}`, name: "Solo Planchado", price: service.ironPrice });
    }
    if (service.bothPrice && parseFloat(service.bothPrice) > 0) {
      existingTypes.push({ id: `both_${Date.now()}`, name: "Lavado + Planchado", price: service.bothPrice });
    }
    
    // Si no hay tipos existentes, crear uno vacío
    if (existingTypes.length === 0) {
      existingTypes.push({ id: `service_${Date.now()}`, name: "", price: "" });
    }
    
    setServiceTypes(existingTypes);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingService(null);
    form.reset();
    // Resetear tipos de servicio al estado inicial
    setServiceTypes([{ id: `service_${Date.now()}`, name: "", price: "" }]);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="tech-button-3d bg-white dark:bg-gray-800/50 border-2 border-cyan-300 dark:border-cyan-500/30 rounded-xl shadow-sm dark:backdrop-blur-sm">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center mx-auto tech-glow animate-pulse">
                <Package className="w-6 h-6 text-white" />
              </div>
              <p className="text-gray-600 dark:text-gray-400">Cargando servicios...</p>
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
                <Package className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold text-gray-800 dark:text-white">Gestión de Servicios</CardTitle>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Configura precios y tipos de servicio</p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => {
                    setEditingService(null);
                    setServiceTypes([
                      { id: `service_${Date.now()}`, name: "", price: "" }
                    ]);
                    setIsDialogOpen(true);
                  }}
                  className="tech-button-3d bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 text-green-700 dark:bg-gradient-to-br dark:from-green-500/20 dark:to-emerald-600/20 dark:text-green-300 dark:border-green-500/30 hover:from-green-100 hover:to-emerald-100 hover:border-green-400 dark:hover:from-green-400/30 dark:hover:to-emerald-500/30 transition-all duration-300 transform hover:scale-105 tech-glow px-6 py-3"
                  data-testid="button-add-service"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Crear Servicio
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </CardHeader>
        
        {/* Estadísticas */}
        {services.length > 0 && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="tech-button-3d bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 dark:border-blue-500/30 rounded-xl p-4 text-center">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.total}</p>
                <p className="text-sm text-blue-600 dark:text-blue-400">Total Servicios</p>
              </div>
              <div className="tech-button-3d bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 dark:border-green-500/30 rounded-xl p-4 text-center">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">RD${stats.avgWashPrice.toFixed(0)}</p>
                <p className="text-sm text-green-600 dark:text-green-400">Prom. Lavado</p>
              </div>
              <div className="tech-button-3d bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 dark:border-purple-500/30 rounded-xl p-4 text-center">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">RD${stats.avgIronPrice.toFixed(0)}</p>
                <p className="text-sm text-purple-600 dark:text-purple-400">Prom. Planchado</p>
              </div>
              <div className="tech-button-3d bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-300 dark:border-orange-500/30 rounded-xl p-4 text-center">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">RD${stats.maxPrice.toFixed(0)}</p>
                <p className="text-sm text-orange-600 dark:text-orange-400">Precio Máximo</p>
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
                placeholder="Buscar servicios por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-2 border-gray-300 dark:border-gray-600 focus:border-cyan-400 dark:focus:border-cyan-400"
                data-testid="input-search-services"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="tech-button-3d border-2 border-gray-300 hover:border-gray-400"
              data-testid="button-toggle-filters"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
          
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Categoría</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las categorías" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      <SelectItem value="clothing">Ropa</SelectItem>
                      <SelectItem value="bedding">Ropa de cama</SelectItem>
                      <SelectItem value="special">Especiales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Lista de servicios */}
      <div className="grid gap-4">
        {filteredServices.map((service) => (
          <Card key={service.id} className="tech-button-3d bg-white dark:bg-gray-800/50 border-2 border-blue-300 dark:border-blue-500/30 rounded-xl shadow-sm hover:shadow-lg hover:border-blue-400 dark:hover:border-blue-400 transition-all duration-300 dark:backdrop-blur-sm" data-testid={`service-card-${service.id}`}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center tech-glow">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-blue-700 dark:text-blue-300" data-testid={`service-name-${service.id}`}>
                      {service.name}
                    </CardTitle>
                    <Badge variant="secondary" className="mt-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      Servicio Activo
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(service)}
                  className="tech-button-3d bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-300 text-cyan-700 dark:bg-gradient-to-br dark:from-cyan-500/20 dark:to-blue-600/20 dark:text-cyan-300 dark:border-cyan-500/30 hover:from-cyan-100 hover:to-blue-100 hover:border-cyan-400 dark:hover:from-cyan-400/30 dark:hover:to-blue-500/30 transition-all duration-300 transform hover:scale-105 tech-glow"
                  data-testid={`button-edit-service-${service.id}`}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="tech-button-3d bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 dark:border-green-500/30 rounded-xl p-4 text-center hover:from-green-100 hover:to-emerald-100 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400 mb-1 font-medium">Solo Lavado</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300" data-testid={`service-wash-price-${service.id}`}>
                    RD${parseFloat(service.washPrice).toFixed(2)}
                  </p>
                </div>
                <div className="tech-button-3d bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 dark:border-purple-500/30 rounded-xl p-4 text-center hover:from-purple-100 hover:to-pink-100 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-sm text-purple-600 dark:text-purple-400 mb-1 font-medium">Solo Planchado</p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300" data-testid={`service-iron-price-${service.id}`}>
                    RD${parseFloat(service.ironPrice).toFixed(2)}
                  </p>
                </div>
                <div className="tech-button-3d bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-300 dark:border-orange-500/30 rounded-xl p-4 text-center hover:from-orange-100 hover:to-red-100 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-sm text-orange-600 dark:text-orange-400 mb-1 font-medium">Lavado + Planchado</p>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-300" data-testid={`service-both-price-${service.id}`}>
                    RD${parseFloat(service.bothPrice).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Modal mejorado */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center tech-glow">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-white">
                  {editingService ? "Editar Servicio" : "Crear Nuevo Servicio"}
                </DialogTitle>
                <p className="text-gray-600 dark:text-gray-400">Configure precios y tipos de servicio personalizados</p>
              </div>
            </div>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Información básica */}
            <Card className="tech-button-3d bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 dark:border-blue-500/30 rounded-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-blue-700 dark:text-blue-300">
                  <Package className="w-5 h-5 mr-2" />
                  Información del Servicio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="name" className="text-blue-700 dark:text-blue-300 font-medium">Nombre del Servicio *</Label>
                    <Input
                      id="name"
                      {...form.register("name")}
                      placeholder="Ej: PANTALONES, CAMISAS, EDREDONES"
                      className="border-2 border-blue-300 focus:border-blue-400 dark:border-blue-500/30"
                      data-testid="input-service-name"
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tipos de servicio flexibles */}
            <Card className="tech-button-3d bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 dark:border-green-500/30 rounded-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-green-700 dark:text-green-300">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Tipos de Servicio y Precios
                  </CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addServiceType}
                    className="tech-button-3d bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 text-green-700 hover:from-green-100 hover:to-emerald-100"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar Tipo
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {serviceTypes.map((type, index) => (
                    <div key={type.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end p-4 border-2 border-green-200 dark:border-green-700/30 rounded-lg bg-white dark:bg-gray-800/50">
                      <div>
                        <Label className="text-green-700 dark:text-green-300 font-medium">Tipo de Servicio</Label>
                        <Input
                          value={type.name}
                          onChange={(e) => updateServiceType(type.id, 'name', e.target.value)}
                          placeholder="Ej: Solo Lavado, En Seco, Express, Planchado"
                          className="border-2 border-green-300 focus:border-green-400"
                        />
                      </div>
                      <div>
                        <Label className="text-green-700 dark:text-green-300 font-medium">Precio (RD$)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={type.price}
                          onChange={(e) => updateServiceType(type.id, 'price', e.target.value)}
                          placeholder="0.00"
                          className="border-2 border-green-300 focus:border-green-400"
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeServiceType(type.id)}
                          className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                          disabled={serviceTypes.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Botones de acción */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleDialogClose}
                className="flex-1 tech-button-3d border-2 border-gray-300 hover:border-gray-400"
                data-testid="button-cancel-service"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createServiceMutation.isPending}
                className="flex-1 tech-button-3d bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-300 text-cyan-700 dark:bg-gradient-to-br dark:from-cyan-500/20 dark:to-blue-600/20 dark:text-cyan-300 dark:border-cyan-500/30 hover:from-cyan-100 hover:to-blue-100 hover:border-cyan-400 dark:hover:from-cyan-400/30 dark:hover:to-blue-500/30 transition-all duration-300 transform hover:scale-105 tech-glow"
                data-testid="button-save-service"
              >
                <Save className="w-4 h-4 mr-2" />
                {createServiceMutation.isPending ? "Guardando..." : editingService ? "Actualizar Servicio" : "Crear Servicio"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Estado vacío mejorado */}
      {services.length === 0 && (
        <Card className="tech-button-3d bg-white dark:bg-gray-800/50 border-2 border-gray-300 dark:border-gray-500/30 rounded-xl shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl flex items-center justify-center tech-glow">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">No hay servicios configurados</h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md">Comienza creando tu primer servicio con precios personalizados para diferentes tipos de lavandería.</p>
            </div>
            <Button 
              onClick={() => {
                setServiceTypes([
                  { id: `service_${Date.now()}`, name: "", price: "" }
                ]);
                setIsDialogOpen(true);
              }}
              className="tech-button-3d bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-300 text-cyan-700 dark:bg-gradient-to-br dark:from-cyan-500/20 dark:to-blue-600/20 dark:text-cyan-300 dark:border-cyan-500/30 hover:from-cyan-100 hover:to-blue-100 hover:border-cyan-400 dark:hover:from-cyan-400/30 dark:hover:to-blue-500/30 transition-all duration-300 transform hover:scale-105 tech-glow px-6 py-3"
              data-testid="button-add-first-service"
            >
              <Plus className="w-5 h-5 mr-2" />
              Configurar Primer Servicio
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
