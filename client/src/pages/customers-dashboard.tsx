import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, UserX, TrendingUp, Crown, Award, Calendar } from "lucide-react";

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

export default function CustomersDashboard() {
  // Fetch customer overview metrics
  const { data: overview, isLoading: overviewLoading } = useQuery<CustomerOverview>({
    queryKey: ["/api/customers/overview"],
  });

  // Fetch top spending customers  
  const { data: topSpenders = [], isLoading: spendersLoading, error: spendersError } = useQuery<TopCustomer[]>({
    queryKey: ["/api/customers/top-spent", { limit: 3 }],
  });

  // Fetch top frequent customers
  const { data: topFrequent = [], isLoading: frequentLoading, error: frequentError } = useQuery<TopCustomer[]>({
    queryKey: ["/api/customers/top-orders", { limit: 3 }],
  });

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
                    <div className="text-right">
                      <p className="font-bold text-yellow-700 dark:text-yellow-300" data-testid={`text-spender-amount-${index + 1}`}>
                        ${customer.totalSpent}
                      </p>
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
                    <div className="text-right">
                      <p className="font-bold text-indigo-700 dark:text-indigo-300" data-testid={`text-frequent-orders-${index + 1}`}>
                        {customer.ordersCount} órdenes
                      </p>
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
    </div>
  );
}