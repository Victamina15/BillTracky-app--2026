import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, UserCheck, UserX, TrendingUp, Crown, Award, Calendar, Send, Eye, DollarSign, ShoppingCart, Clock } from "lucide-react";

interface CustomerOverview {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  avgOrderValue: string;
}

interface TopCustomer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  totalSpent: string;
  ordersCount: number;
}

interface InactiveCustomer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  lastOrderDate: string;
  daysSinceLastOrder: number;
}

interface CustomerStats {
  customer: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
  totalSpent: string;
  ordersCount: number;
  avgOrderValue: string;
  lastOrderAt: string | null;
  orderDates: string[];
}

export default function CustomersDashboard() {
  const [inactiveDays, setInactiveDays] = useState<number>(30);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const { toast } = useToast();
  
  // Get employeeId from localStorage for authentication
  const employeeId = localStorage.getItem('employeeId');
  
  // Fetch customer overview metrics
  const { data: overview, isLoading: overviewLoading } = useQuery<CustomerOverview>({
    queryKey: ["/api/customers/overview"],
    enabled: !!employeeId,
  });

  // Fetch top spending customers  
  const { data: topSpenders = [], isLoading: spendersLoading, error: spendersError } = useQuery<TopCustomer[]>({
    queryKey: ["/api/customers/top-spent", { limit: 3 }],
    enabled: !!employeeId,
  });

  // Fetch top frequent customers
  const { data: topFrequent = [], isLoading: frequentLoading, error: frequentError } = useQuery<TopCustomer[]>({
    queryKey: ["/api/customers/top-orders", { limit: 3 }],
    enabled: !!employeeId,
  });

  // Fetch inactive customers based on selected days
  const { data: inactiveCustomers = [], isLoading: inactiveLoading, error: inactiveError } = useQuery<InactiveCustomer[]>({
    queryKey: ["/api/customers/inactive", { days: inactiveDays }],
    enabled: !!employeeId,
  });

  // Fetch customer stats when modal is opened
  const { data: customerStats, isLoading: statsLoading, error: statsError } = useQuery<CustomerStats>({
    queryKey: [`/api/customers/${selectedCustomerId}/stats`],
    enabled: !!selectedCustomerId && isStatsModalOpen && !!employeeId,
  });

  // Send reminders mutation
  const sendRemindersMutation = useMutation({
    mutationFn: async (days: number) => {
      const response = await apiRequest('POST', '/api/messages/send-inactive', { days });
      return response.json();
    },
    onSuccess: (result: any) => {
      const { summary } = result;
      toast({
        title: "Recordatorios enviados",
        description: `Se enviaron ${summary.sent} recordatorios de ${summary.attempted} clientes`,
      });
      // Invalidate the inactive customers query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/customers/inactive', { days: inactiveDays }] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudieron enviar los recordatorios",
        variant: "destructive",
      });
    }
  });

  const openStatsModal = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setIsStatsModalOpen(true);
  };

  const closeStatsModal = () => {
    setIsStatsModalOpen(false);
    setSelectedCustomerId(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-800 dark:to-blue-800 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2" data-testid="text-dashboard-title">
          Centro de Inteligencia de Clientes
        </h1>
        <p className="text-cyan-100 dark:text-cyan-200">
          Métricas empresariales y análisis de clientes para optimizar tu negocio
        </p>
      </div>

      {/* KPIs Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Customers */}
        <Card className="tech-button-3d bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-300 dark:border-blue-500/30 rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2" data-testid="header-total-customers">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Total de Clientes
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {overviewLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-blue-200 rounded w-16"></div>
              </div>
            ) : (
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300" data-testid="text-total-customers">
                {overview?.totalCustomers || 0}
              </div>
            )}
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Base total de clientes
            </p>
          </CardContent>
        </Card>

        {/* Active Customers */}
        <Card className="tech-button-3d bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-500/30 rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2" data-testid="header-active-customers">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
              Clientes Activos
            </CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {overviewLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-green-200 rounded w-16"></div>
              </div>
            ) : (
              <div className="text-2xl font-bold text-green-700 dark:text-green-300" data-testid="text-active-customers">
                {overview?.activeCustomers || 0}
              </div>
            )}
            <p className="text-xs text-green-600 dark:text-green-400">
              Últimos 30 días
            </p>
          </CardContent>
        </Card>

        {/* Inactive Customers */}
        <Card className="tech-button-3d bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-300 dark:border-orange-500/30 rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2" data-testid="header-inactive-customers">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
              Clientes Inactivos
            </CardTitle>
            <UserX className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            {overviewLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-orange-200 rounded w-16"></div>
              </div>
            ) : (
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-300" data-testid="text-inactive-customers">
                {overview?.inactiveCustomers || 0}
              </div>
            )}
            <p className="text-xs text-orange-600 dark:text-orange-400">
              Más de 30 días sin órdenes
            </p>
          </CardContent>
        </Card>

        {/* Average Order Value */}
        <Card className="tech-button-3d bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-300 dark:border-purple-500/30 rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2" data-testid="header-avg-order-value">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Valor Promedio
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            {overviewLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-purple-200 rounded w-20"></div>
              </div>
            ) : (
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300" data-testid="text-avg-order-value">
                ${overview?.avgOrderValue || "0.00"}
              </div>
            )}
            <p className="text-xs text-purple-600 dark:text-purple-400">
              Por orden pagada
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Spenders */}
        <Card className="tech-button-3d bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-2 border-yellow-300 dark:border-yellow-500/30 rounded-xl">
          <CardHeader data-testid="header-top-spenders">
            <CardTitle className="flex items-center text-yellow-700 dark:text-yellow-300">
              <Crown className="w-5 h-5 mr-2" />
              Top 3 - Clientes que Más Gastan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {spendersLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-4">
                    <div className="w-8 h-8 bg-yellow-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-yellow-200 rounded w-3/4"></div>
                      <div className="h-3 bg-yellow-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {topSpenders.map((customer, index) => (
                  <div key={customer.id} className="flex items-center justify-between p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant={index === 0 ? "default" : "secondary"} 
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? "bg-yellow-500 text-white" : 
                          index === 1 ? "bg-gray-400 text-white" : 
                          "bg-amber-600 text-white"
                        }`}
                        data-testid={`badge-top-spender-${index + 1}`}
                      >
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium text-yellow-700 dark:text-yellow-300" data-testid={`text-spender-name-${index + 1}`}>
                          {customer.name}
                        </p>
                        <p className="text-sm text-yellow-600 dark:text-yellow-400">
                          {customer.ordersCount} órdenes
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="font-bold text-yellow-700 dark:text-yellow-300" data-testid={`text-spender-amount-${index + 1}`}>
                          ${customer.totalSpent}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openStatsModal(customer.id)}
                        className="border-yellow-300 text-yellow-700 hover:bg-yellow-50 dark:border-yellow-500 dark:text-yellow-300 dark:hover:bg-yellow-900/20"
                        data-testid={`button-stats-spender-${index + 1}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {spendersError && (
                  <p className="text-center text-red-600 dark:text-red-400 py-4" data-testid="error-top-spenders">
                    Error al cargar datos de clientes
                  </p>
                )}
                {!spendersLoading && !spendersError && topSpenders.length === 0 && (
                  <p className="text-center text-yellow-600 dark:text-yellow-400 py-4" data-testid="empty-top-spenders">
                    No hay datos de clientes disponibles
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Frequent */}
        <Card className="tech-button-3d bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-2 border-indigo-300 dark:border-indigo-500/30 rounded-xl">
          <CardHeader data-testid="header-top-frequent">
            <CardTitle className="flex items-center text-indigo-700 dark:text-indigo-300">
              <Award className="w-5 h-5 mr-2" />
              Top 3 - Clientes Más Frecuentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {frequentLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-4">
                    <div className="w-8 h-8 bg-indigo-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-indigo-200 rounded w-3/4"></div>
                      <div className="h-3 bg-indigo-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {topFrequent.map((customer, index) => (
                  <div key={customer.id} className="flex items-center justify-between p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant={index === 0 ? "default" : "secondary"} 
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? "bg-indigo-500 text-white" : 
                          index === 1 ? "bg-gray-400 text-white" : 
                          "bg-blue-600 text-white"
                        }`}
                        data-testid={`badge-top-frequent-${index + 1}`}
                      >
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium text-indigo-700 dark:text-indigo-300" data-testid={`text-frequent-name-${index + 1}`}>
                          {customer.name}
                        </p>
                        <p className="text-sm text-indigo-600 dark:text-indigo-400">
                          ${customer.totalSpent} gastado
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="font-bold text-indigo-700 dark:text-indigo-300" data-testid={`text-frequent-orders-${index + 1}`}>
                          {customer.ordersCount} órdenes
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openStatsModal(customer.id)}
                        className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-500 dark:text-indigo-300 dark:hover:bg-indigo-900/20"
                        data-testid={`button-stats-frequent-${index + 1}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {frequentError && (
                  <p className="text-center text-red-600 dark:text-red-400 py-4" data-testid="error-top-frequent">
                    Error al cargar datos de clientes
                  </p>
                )}
                {!frequentLoading && !frequentError && topFrequent.length === 0 && (
                  <p className="text-center text-indigo-600 dark:text-indigo-400 py-4" data-testid="empty-top-frequent">
                    No hay datos de clientes disponibles
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Inactive Customers Management */}
      <Card className="tech-button-3d bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-300 dark:border-red-500/30 rounded-xl">
        <CardHeader data-testid="header-inactive-management">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <CardTitle className="flex items-center text-red-700 dark:text-red-300">
              <Calendar className="w-5 h-5 mr-2" />
              Gestión de Clientes Inactivos
            </CardTitle>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-red-600 dark:text-red-400">
                  Inactivos por más de:
                </span>
                <Select value={inactiveDays.toString()} onValueChange={(value) => setInactiveDays(Number(value))}>
                  <SelectTrigger className="w-24" data-testid="select-inactive-days">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 días</SelectItem>
                    <SelectItem value="60">60 días</SelectItem>
                    <SelectItem value="90">90 días</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                onClick={() => sendRemindersMutation.mutate(inactiveDays)}
                disabled={inactiveCustomers.length === 0 || sendRemindersMutation.isPending}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                data-testid="button-send-reminders"
              >
                <Send className="w-4 h-4 mr-2" />
                {sendRemindersMutation.isPending ? 'Enviando...' : 'Enviar Recordatorios'}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {inactiveLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4 p-4 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  <div className="w-12 h-12 bg-red-300 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-red-300 rounded w-1/3"></div>
                    <div className="h-3 bg-red-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-6 bg-red-300 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {inactiveCustomers.map((customer, index) => (
                <div 
                  key={customer.id} 
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 rounded-lg border border-red-200 dark:border-red-500/30"
                  data-testid={`row-inactive-${customer.id}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-red-700 dark:text-red-300" data-testid={`text-inactive-name-${customer.id}`}>
                        {customer.name}
                      </h3>
                      <p className="text-sm text-red-600 dark:text-red-400" data-testid={`text-inactive-phone-${customer.id}`}>
                        {customer.phone} • Última orden: {new Date(customer.lastOrderDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge variant="destructive" className="bg-red-500 dark:bg-red-600" data-testid={`text-inactive-days-${customer.id}`}>
                      {customer.daysSinceLastOrder} días
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openStatsModal(customer.id)}
                      className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-500 dark:text-red-300 dark:hover:bg-red-900/20"
                      data-testid={`button-stats-inactive-${customer.id}`}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {inactiveError && (
                <p className="text-center text-red-600 dark:text-red-400 py-4" data-testid="error-inactive-customers">
                  Error al cargar clientes inactivos
                </p>
              )}
              
              {!inactiveLoading && !inactiveError && inactiveCustomers.length === 0 && (
                <div className="text-center py-8" data-testid="empty-inactive-customers">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserCheck className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-green-600 dark:text-green-400 font-medium">
                    ¡Excelente! No hay clientes inactivos en los últimos {inactiveDays} días
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Stats Modal */}
      <Dialog open={isStatsModalOpen} onOpenChange={(open) => { setIsStatsModalOpen(open); if (!open) setSelectedCustomerId(null); }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl font-bold text-cyan-700 dark:text-cyan-300">
              <Users className="w-6 h-6 mr-2" />
              Estadísticas Detalladas del Cliente
            </DialogTitle>
          </DialogHeader>
          
          {statsLoading ? (
            <div className="space-y-6 p-4">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-20 bg-gray-200 rounded"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          ) : statsError ? (
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400" data-testid="error-customer-stats">
                Error al cargar estadísticas del cliente
              </p>
            </div>
          ) : customerStats ? (
            <div className="space-y-6 p-4">
              {/* Customer Info */}
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-cyan-200 dark:border-cyan-500/30">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    {customerStats.customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-cyan-700 dark:text-cyan-300" data-testid="text-modal-customer-name">
                      {customerStats.customer.name}
                    </h3>
                    <p className="text-cyan-600 dark:text-cyan-400" data-testid="text-modal-customer-phone">
                      {customerStats.customer.phone}
                    </p>
                    {customerStats.customer.email && (
                      <p className="text-sm text-cyan-500 dark:text-cyan-500" data-testid="text-modal-customer-email">
                        {customerStats.customer.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-500/30">
                  <CardContent className="p-4 text-center">
                    <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300" data-testid="text-modal-total-spent">
                      ${customerStats.totalSpent}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">Total Gastado</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-500/30">
                  <CardContent className="p-4 text-center">
                    <ShoppingCart className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300" data-testid="text-modal-orders-count">
                      {customerStats.ordersCount}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">Órdenes Totales</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-500/30">
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-300" data-testid="text-modal-avg-order">
                      ${customerStats.avgOrderValue}
                    </p>
                    <p className="text-xs text-purple-600 dark:text-purple-400">Promedio por Orden</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-500/30">
                  <CardContent className="p-4 text-center">
                    <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-lg font-bold text-orange-700 dark:text-orange-300" data-testid="text-modal-last-order">
                      {customerStats.lastOrderAt 
                        ? new Date(customerStats.lastOrderAt).toLocaleDateString()
                        : 'Nunca'
                      }
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-400">Última Orden</p>
                  </CardContent>
                </Card>
              </div>

              {/* Order History */}
              <Card className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border-gray-200 dark:border-gray-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-700 dark:text-gray-300">
                    <Calendar className="w-5 h-5 mr-2" />
                    Historial de Órdenes ({customerStats.orderDates.length} órdenes)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {customerStats.orderDates.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                      {customerStats.orderDates.slice(0, 20).map((date, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="text-xs justify-center"
                          data-testid={`badge-order-date-${index}`}
                        >
                          {new Date(date).toLocaleDateString()}
                        </Badge>
                      ))}
                      {customerStats.orderDates.length > 20 && (
                        <Badge variant="outline" className="text-xs justify-center">
                          +{customerStats.orderDates.length - 20} más
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4" data-testid="empty-order-history">
                      No hay historial de órdenes disponible
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}