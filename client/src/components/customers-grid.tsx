import { useState } from "react";
import { Plus, User, Edit3 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Customer, insertCustomerSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CustomersGridProps {
  onNotification: (message: string) => void;
}

export default function CustomersGrid({ onNotification }: CustomersGridProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const form = useForm({
    resolver: zodResolver(insertCustomerSchema),
    defaultValues: {
      name: "",
      phone: "",
    },
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/customers", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      onNotification("Cliente creado exitosamente");
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      onNotification("Error al crear el cliente");
    },
  });

  const handleSubmit = (data: any) => {
    createCustomerMutation.mutate(data);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    form.setValue("name", customer.name);
    form.setValue("phone", customer.phone);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingCustomer(null);
    form.reset();
  };

  if (isLoading) {
    return (
      <div className="bg-card dark:bg-gray-800/50 rounded-xl dark:shadow-xl tech-glow border border-border dark:border-cyan-500/20 p-6 backdrop-blur-sm">
        <div className="text-center py-8">
          <p className="text-muted-foreground dark:text-gray-300">Cargando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card dark:bg-gray-800/50 rounded-xl dark:shadow-xl tech-glow border border-border dark:border-cyan-500/20 p-6 backdrop-blur-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-xl font-semibold text-card-foreground dark:text-white mb-4 md:mb-0 tech-text-glow">
          Gestión de Clientes
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="tech-button-3d bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 dark:shadow-xl"
              data-testid="button-add-customer"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCustomer ? "Editar Cliente" : "Nuevo Cliente"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="Nombre completo del cliente"
                  data-testid="input-customer-name"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  {...form.register("phone")}
                  placeholder="809-000-0000"
                  data-testid="input-customer-phone"
                />
                {form.formState.errors.phone && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.phone.message}
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={createCustomerMutation.isPending}
                  className="tech-button-3d bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700"
                  data-testid="button-save-customer"
                >
                  {createCustomerMutation.isPending ? "Guardando..." : "Guardar"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDialogClose}
                  className="tech-button-3d border-gray-600 text-gray-300 hover:bg-gray-700"
                  data-testid="button-cancel"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map((customer) => (
          <div key={customer.id} className="bg-card dark:bg-gray-800/50 rounded-lg p-4 tech-glow border border-border dark:border-cyan-500/20 backdrop-blur-sm dark:shadow-xl dark:hover:shadow-2xl transition-all duration-300" data-testid={`customer-card-${customer.id}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400/20 to-purple-500/20 rounded-full flex items-center justify-center border border-cyan-400/30">
                <User className="w-6 h-6 text-cyan-400" />
              </div>
              <button 
                onClick={() => handleEdit(customer)}
                className="tech-button-3d p-1 text-gray-300 hover:text-cyan-400 rounded-lg"
                data-testid={`button-edit-customer-${customer.id}`}
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
            <h3 className="font-medium text-card-foreground mb-1" data-testid={`customer-name-${customer.id}`}>
              {customer.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-2" data-testid={`customer-phone-${customer.id}`}>
              {customer.phone}
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Órdenes: <span data-testid={`customer-orders-${customer.id}`}>{customer.ordersCount}</span>
              </span>
              <span className="text-green-600 dark:text-green-400 font-medium" data-testid={`customer-spent-${customer.id}`}>
                RD${parseFloat(customer.totalSpent || "0").toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {customers.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No hay clientes registrados.</p>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="mt-4"
            data-testid="button-add-first-customer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar primer cliente
          </Button>
        </div>
      )}
    </div>
  );
}
