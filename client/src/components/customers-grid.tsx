import { useState } from "react";
import { Plus, User, Edit3, Search, Filter, Grid3X3, List, TrendingUp, Users, Star, Eye, Mail, Phone, Calendar, DollarSign, ArrowUpDown, Download, MessageSquare } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Customer, insertCustomerSchema } from "@shared/schema";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CustomersGridProps {
  onNotification: (message: string) => void;
}

type ViewMode = 'grid' | 'table';
type SortField = 'name' | 'totalSpent' | 'ordersCount' | 'createdAt';
type SortOrder = 'asc' | 'desc';
type CustomerSegment = 'all' | 'vip' | 'frequent' | 'new' | 'inactive';

export default function CustomersGrid({ onNotification }: CustomersGridProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedSegment, setSelectedSegment] = useState<CustomerSegment>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const form = useForm({
    resolver: zodResolver(insertCustomerSchema.extend({
      email: z.string().email().optional().or(z.literal('')),
    })),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
    },
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (data: any) => {
      const method = editingCustomer ? "PUT" : "POST";
      const url = editingCustomer ? `/api/customers/${editingCustomer.id}` : "/api/customers";
      const response = await apiRequest(method, url, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      const message = editingCustomer ? "Cliente actualizado exitosamente" : "Cliente creado exitosamente";
      onNotification(message);
      setIsDialogOpen(false);
      setEditingCustomer(null);
      form.reset();
    },
    onError: () => {
      const message = editingCustomer ? "Error al actualizar el cliente" : "Error al crear el cliente";
      onNotification(message);
    },
  });

  const handleSubmit = (data: any) => {
    createCustomerMutation.mutate(data);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    form.setValue("name", customer.name);
    form.setValue("phone", customer.phone);
    form.setValue("email", customer.email || "");
    setIsDialogOpen(true);
  };

  // Helper functions for Shopify-like features
  const getCustomerSegment = (customer: Customer): string => {
    const totalSpent = parseFloat(customer.totalSpent || "0");
    const ordersCount = customer.ordersCount || 0;
    const daysOld = customer.createdAt ? 
      Math.floor((new Date().getTime() - new Date(customer.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : Infinity;
    
    if (totalSpent > 10000 || ordersCount > 20) return 'VIP';
    if (ordersCount > 5) return 'Frecuente';
    if (customer.createdAt && daysOld < 30) return 'Nuevo';
    if (daysOld > 180 && ordersCount === 0) return 'Inactivo';
    return 'Regular';
  };

  const getSegmentColor = (segment: string): string => {
    switch (segment) {
      case 'VIP': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      case 'Frecuente': return 'bg-gradient-to-r from-purple-400 to-pink-500 text-white';
      case 'Nuevo': return 'bg-gradient-to-r from-green-400 to-blue-500 text-white';
      case 'Inactivo': return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
      default: return 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white';
    }
  };

  // Filter and sort customers
  const filteredAndSortedCustomers = customers
    .filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.phone.includes(searchTerm) ||
                           (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (!matchesSearch) return false;
      
      const segment = getCustomerSegment(customer);
      if (selectedSegment === 'all') return true;
      if (selectedSegment === 'vip' && segment === 'VIP') return true;
      if (selectedSegment === 'frequent' && segment === 'Frecuente') return true;
      if (selectedSegment === 'new' && segment === 'Nuevo') return true;
      if (selectedSegment === 'inactive' && segment === 'Inactivo') return true;
      
      return false;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'totalSpent':
          aValue = parseFloat(a.totalSpent || "0");
          bValue = parseFloat(b.totalSpent || "0");
          break;
        case 'ordersCount':
          aValue = a.ordersCount || 0;
          bValue = b.ordersCount || 0;
          break;
        case 'createdAt':
          aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  // Calculate statistics
  const stats = {
    total: customers.length,
    totalSpent: customers.reduce((sum, c) => sum + parseFloat(c.totalSpent || "0"), 0),
    avgSpent: customers.length > 0 ? customers.reduce((sum, c) => sum + parseFloat(c.totalSpent || "0"), 0) / customers.length : 0,
    vipCount: customers.filter(c => getCustomerSegment(c) === 'VIP').length,
    newThisMonth: customers.filter(c => {
      if (!c.createdAt) return false;
      const createdAt = new Date(c.createdAt);
      const now = new Date();
      return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
    }).length,
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingCustomer(null);
    form.reset();
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
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
              <p className="text-muted-foreground dark:text-gray-300">🔍 Cargando clientes...</p>
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
          <h1 className="text-3xl font-bold tech-text-glow bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
            👥 Panel de Clientes
          </h1>
          <p className="text-muted-foreground">Gestiona tu base de clientes con herramientas avanzadas estilo Shopify</p>
        </div>
        <div className="flex items-center space-x-3">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button 
                onClick={() => setIsDialogOpen(true)}
                className="tech-button-3d bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg font-bold text-sm flex items-center space-x-2 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border-2 border-green-300 shadow-lg tech-glow"
                data-testid="button-add-customer"
              >
                <Plus className="w-5 h-5" />
                <span>➕ Nuevo Cliente</span>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingCustomer ? "✏️ Editar Cliente" : "➕ Nuevo Cliente"}
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
                <div>
                  <Label htmlFor="email">Email (Opcional)</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register("email")}
                    placeholder="cliente@email.com"
                    data-testid="input-customer-email"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={createCustomerMutation.isPending}
                    className="tech-button-3d bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 border-2 border-cyan-300 shadow-lg tech-glow flex-1"
                    data-testid="button-save-customer"
                  >
                    {createCustomerMutation.isPending ? "💾 Guardando..." : "💾 Guardar"}
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="tech-glow border-2 border-slate-300/50 dark:border-cyan-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-blue-600 dark:text-cyan-400">{stats.total}</CardTitle>
                <CardDescription>👥 Total Clientes</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="tech-glow border-2 border-slate-300/50 dark:border-purple-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-purple-600 dark:text-purple-400">RD${stats.totalSpent.toFixed(0)}</CardTitle>
                <CardDescription>💰 Ingresos Total</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="tech-glow border-2 border-slate-300/50 dark:border-green-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-green-600 dark:text-green-400">RD${stats.avgSpent.toFixed(0)}</CardTitle>
                <CardDescription>📊 Promedio por Cliente</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="tech-glow border-2 border-slate-300/50 dark:border-yellow-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.vipCount}</CardTitle>
                <CardDescription>⭐ Clientes VIP</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="tech-glow border-2 border-slate-300/50 dark:border-indigo-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.newThisMonth}</CardTitle>
                <CardDescription>🆕 Nuevos Este Mes</CardDescription>
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
                placeholder="🔍 Buscar por nombre, teléfono o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 tech-glow border-2 border-slate-300/50 focus:border-cyan-500/50"
                data-testid="input-search-customers"
              />
            </div>
            <div className="flex items-center space-x-4">
              <Select value={selectedSegment} onValueChange={(value: CustomerSegment) => setSelectedSegment(value)}>
                <SelectTrigger className="w-48 tech-glow border-2 border-slate-300/50" data-testid="select-segment">
                  <SelectValue placeholder="Segmento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">🌟 Todos los Clientes</SelectItem>
                  <SelectItem value="vip">👑 Clientes VIP</SelectItem>
                  <SelectItem value="frequent">🔥 Clientes Frecuentes</SelectItem>
                  <SelectItem value="new">✨ Clientes Nuevos</SelectItem>
                  <SelectItem value="inactive">😴 Clientes Inactivos</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'grid' ? 'tech-button-3d bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-2 border-cyan-300 shadow-lg tech-glow' : 'border-2 border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700'}`}
                  data-testid="button-grid-view"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'table' ? 'tech-button-3d bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-2 border-cyan-300 shadow-lg tech-glow' : 'border-2 border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700'}`}
                  data-testid="button-table-view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedCustomers.map((customer) => {
            const segment = getCustomerSegment(customer);
            return (
              <Card key={customer.id} className="tech-glow border-2 border-slate-300/50 dark:border-cyan-500/20 hover:border-cyan-500/50 dark:hover:border-cyan-400/50 transition-all duration-300 hover:shadow-lg hover:scale-105" data-testid={`customer-card-${customer.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-400/20 to-purple-500/20 rounded-full flex items-center justify-center border-2 border-cyan-400/30">
                        <User className="w-6 h-6 text-cyan-400" />
                      </div>
                      <div className="flex flex-col">
                        <Badge className={`${getSegmentColor(segment)} text-xs px-2 py-1 mb-1`}>{segment}</Badge>
                        <h3 className="font-semibold text-card-foreground" data-testid={`customer-name-${customer.id}`}>
                          {customer.name}
                        </h3>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleEdit(customer)}
                      className="tech-button-3d p-2 bg-gradient-to-r from-slate-400 to-slate-500 text-white hover:from-slate-500 hover:to-slate-600 rounded-lg border-2 border-slate-300 shadow-lg transition-all duration-300 hover:scale-110"
                      data-testid={`button-edit-customer-${customer.id}`}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span data-testid={`customer-phone-${customer.id}`}>{customer.phone}</span>
                    </div>
                    {customer.email && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span data-testid={`customer-email-${customer.id}`}>{customer.email}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="text-sm text-muted-foreground">
                        📦 Órdenes: <span className="font-semibold text-foreground" data-testid={`customer-orders-${customer.id}`}>{customer.ordersCount}</span>
                      </div>
                      <div className="text-sm font-bold text-green-600 dark:text-green-400" data-testid={`customer-spent-${customer.id}`}>
                        💰 RD${parseFloat(customer.totalSpent || "0").toFixed(2)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="tech-glow border-2 border-slate-300/50 dark:border-cyan-500/30">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <button
                        onClick={() => handleSort('name')}
                        className="flex items-center space-x-1 font-semibold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400"
                        data-testid="button-sort-name"
                      >
                        <span>👤 Cliente</span>
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">🏷️ Segmento</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">📞 Contacto</th>
                    <th className="px-6 py-4 text-left">
                      <button
                        onClick={() => handleSort('ordersCount')}
                        className="flex items-center space-x-1 font-semibold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400"
                        data-testid="button-sort-orders"
                      >
                        <span>📦 Órdenes</span>
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <button
                        onClick={() => handleSort('totalSpent')}
                        className="flex items-center space-x-1 font-semibold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400"
                        data-testid="button-sort-spent"
                      >
                        <span>💰 Total Gastado</span>
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <button
                        onClick={() => handleSort('createdAt')}
                        className="flex items-center space-x-1 font-semibold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400"
                        data-testid="button-sort-date"
                      >
                        <span>📅 Registro</span>
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-center font-semibold text-slate-700 dark:text-slate-300">⚙️ Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredAndSortedCustomers.map((customer) => {
                    const segment = getCustomerSegment(customer);
                    return (
                      <tr key={customer.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300" data-testid={`customer-row-${customer.id}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400/20 to-purple-500/20 rounded-full flex items-center justify-center border-2 border-cyan-400/30">
                              <User className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                              <div className="font-semibold text-foreground" data-testid={`customer-name-${customer.id}`}>
                                {customer.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={`${getSegmentColor(segment)} text-xs px-2 py-1`}>{segment}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center space-x-2 text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              <span data-testid={`customer-phone-${customer.id}`}>{customer.phone}</span>
                            </div>
                            {customer.email && (
                              <div className="flex items-center space-x-2 text-muted-foreground">
                                <Mail className="w-3 h-3" />
                                <span data-testid={`customer-email-${customer.id}`}>{customer.email}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-foreground" data-testid={`customer-orders-${customer.id}`}>{customer.ordersCount}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-green-600 dark:text-green-400" data-testid={`customer-spent-${customer.id}`}>
                            RD${parseFloat(customer.totalSpent || "0").toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-muted-foreground">
                            {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('es-DO') : 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => handleEdit(customer)}
                            className="tech-button-3d p-2 bg-gradient-to-r from-slate-400 to-slate-500 text-white hover:from-slate-500 hover:to-slate-600 rounded-lg border-2 border-slate-300 shadow-lg transition-all duration-300 hover:scale-110"
                            data-testid={`button-edit-customer-${customer.id}`}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredAndSortedCustomers.length === 0 && (
        <Card className="tech-glow border-2 border-slate-300/50 dark:border-cyan-500/30">
          <CardContent className="p-12">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-12 h-12 text-slate-500 dark:text-slate-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">
                  {searchTerm || selectedSegment !== 'all' ? '🔍 No se encontraron clientes' : '👥 No hay clientes registrados'}
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm || selectedSegment !== 'all' 
                    ? 'Intenta ajustar tu búsqueda o filtros.' 
                    : 'Comienza agregando tu primer cliente al sistema.'
                  }
                </p>
              </div>
              {!searchTerm && selectedSegment === 'all' && (
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  className="tech-button-3d bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg font-bold border-2 border-green-300 shadow-lg tech-glow"
                  data-testid="button-add-first-customer"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  ➕ Agregar Primer Cliente
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
