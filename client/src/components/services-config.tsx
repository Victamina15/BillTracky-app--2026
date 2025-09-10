import { useState } from "react";
import { Plus, Edit3, Save } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Service, insertServiceSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ServicesConfigProps {
  onNotification: (message: string) => void;
}

export default function ServicesConfig({ onNotification }: ServicesConfigProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

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
    createServiceMutation.mutate(data);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    form.setValue("name", service.name);
    form.setValue("washPrice", service.washPrice);
    form.setValue("ironPrice", service.ironPrice);
    form.setValue("bothPrice", service.bothPrice);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingService(null);
    form.reset();
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Cargando servicios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-6">
      <h2 className="text-xl font-semibold text-card-foreground mb-6">
        Configuración de Servicios
      </h2>
      
      <div className="space-y-6">
        {services.map((service) => (
          <div key={service.id} className="border border-border rounded-lg p-6" data-testid={`service-card-${service.id}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-card-foreground" data-testid={`service-name-${service.id}`}>
                {service.name}
              </h3>
              <button 
                onClick={() => handleEdit(service)}
                className="p-2 text-muted-foreground hover:text-card-foreground hover:bg-muted rounded-lg"
                data-testid={`button-edit-service-${service.id}`}
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Solo Lavado</p>
                <p className="text-xl font-bold text-card-foreground" data-testid={`service-wash-price-${service.id}`}>
                  RD${parseFloat(service.washPrice).toFixed(2)}
                </p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Solo Planchado</p>
                <p className="text-xl font-bold text-card-foreground" data-testid={`service-iron-price-${service.id}`}>
                  RD${parseFloat(service.ironPrice).toFixed(2)}
                </p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Lavado + Planchado</p>
                <p className="text-xl font-bold text-card-foreground" data-testid={`service-both-price-${service.id}`}>
                  RD${parseFloat(service.bothPrice).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-testid="button-add-service"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Servicio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingService ? "Editar Servicio" : "Nuevo Servicio"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre del Servicio</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="Ej: PANTALONES"
                  data-testid="input-service-name"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="washPrice">Precio Lavado</Label>
                  <Input
                    id="washPrice"
                    {...form.register("washPrice")}
                    placeholder="80.00"
                    data-testid="input-wash-price"
                  />
                  {form.formState.errors.washPrice && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.washPrice.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="ironPrice">Precio Planchado</Label>
                  <Input
                    id="ironPrice"
                    {...form.register("ironPrice")}
                    placeholder="60.00"
                    data-testid="input-iron-price"
                  />
                  {form.formState.errors.ironPrice && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.ironPrice.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="bothPrice">Precio Ambos</Label>
                  <Input
                    id="bothPrice"
                    {...form.register("bothPrice")}
                    placeholder="110.00"
                    data-testid="input-both-price"
                  />
                  {form.formState.errors.bothPrice && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.bothPrice.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDialogClose}
                  className="flex-1"
                  data-testid="button-cancel-service"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createServiceMutation.isPending}
                  className="flex-1"
                  data-testid="button-save-service"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {createServiceMutation.isPending ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {services.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No hay servicios configurados.</p>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="mt-4"
            data-testid="button-add-first-service"
          >
            <Plus className="w-4 h-4 mr-2" />
            Configurar primer servicio
          </Button>
        </div>
      )}
    </div>
  );
}
