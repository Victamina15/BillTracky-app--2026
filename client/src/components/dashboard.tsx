import { useState } from "react";
import { FileText, LogOut, Home, Package, Users, Settings, CreditCard, BarChart3 } from "lucide-react";
import { type Employee, type Invoice } from "@shared/schema";
import InvoiceCreation from "./invoice-creation";
import OrderManagement from "./order-management";
import CustomersGrid from "./customers-grid";
import ServicesConfig from "./services-config";
import PaymentMethodsConfig from "./payment-methods-config";
import CashClosure from "./cash-closure";
import { useQuery } from "@tanstack/react-query";

interface DashboardProps {
  user: Employee;
  onLogout: () => void;
  onNotification: (message: string) => void;
}

export default function Dashboard({ user, onLogout, onNotification }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: metrics, isLoading: metricsLoading } = useQuery<{
    todayOrders: number;
    todayRevenue: string;
    inProgress: number;
    pendingPayment: number;
    pendingPaymentTotal: string;
  }>({
    queryKey: ["/api/metrics/dashboard"],
  });

  const { data: invoices = [] } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  const recentOrders = invoices.slice(0, 3);

  // Helper functions para obtener clases de estado de forma segura
  const getStatusClasses = (status: string | null) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch(status) {
      case 'received': return 'bg-blue-100 text-blue-800';
      case 'in_process': return 'bg-yellow-100 text-yellow-800'; 
      case 'ready': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string | null) => {
    if (!status) return 'Desconocido';
    
    switch(status) {
      case 'received': return 'Recibido';
      case 'in_process': return 'En Proceso';
      case 'ready': return 'Listo';
      case 'delivered': return 'Entregado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "invoices":
        return <InvoiceCreation onNotification={onNotification} />;
      case "orders":
        return <OrderManagement onNotification={onNotification} />;
      case "customers":
        return <CustomersGrid onNotification={onNotification} />;
      case "services":
        return <ServicesConfig onNotification={onNotification} />;
      case "payment-methods":
        return <PaymentMethodsConfig onNotification={onNotification} />;
      case "cash-closure":
        return <CashClosure onBack={() => setActiveTab('overview')} />;
      default:
        return (
          <div>
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-card rounded-xl shadow-sm border border-border p-6 card-hover">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Órdenes Hoy</p>
                    <p className="text-2xl font-bold text-card-foreground" data-testid="metric-today-orders">
                      {metricsLoading ? "..." : metrics?.todayOrders || 0}
                    </p>
                    <p className="text-xs text-green-600 mt-1">+3 desde ayer</p>
                  </div>
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-secondary" />
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl shadow-sm border border-border p-6 card-hover">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ingresos Hoy</p>
                    <p className="text-2xl font-bold text-card-foreground" data-testid="metric-today-revenue">
                      {metricsLoading ? "..." : `RD$${metrics?.todayRevenue || "0.00"}`}
                    </p>
                    <p className="text-xs text-green-600 mt-1">+15% vs ayer</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg font-bold text-green-600">$</span>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl shadow-sm border border-border p-6 card-hover">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">En Proceso</p>
                    <p className="text-2xl font-bold text-card-foreground" data-testid="metric-in-progress">
                      {metricsLoading ? "..." : metrics?.inProgress || 0}
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">2 listos pronto</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg font-bold text-yellow-600">⏱️</span>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl shadow-sm border border-border p-6 card-hover">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pendientes Pago</p>
                    <p className="text-2xl font-bold text-card-foreground" data-testid="metric-pending-payment">
                      {metricsLoading ? "..." : metrics?.pendingPayment || 0}
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      RD${metrics?.pendingPaymentTotal || "0.00"} total
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg font-bold text-red-600">⚠️</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions and Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                <h3 className="text-lg font-semibold text-card-foreground mb-4">Acciones Rápidas</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setActiveTab('invoices')}
                    className="bg-primary text-primary-foreground p-4 rounded-lg hover:bg-primary/90 transition-colors text-left"
                    data-testid="quick-action-new-invoice"
                  >
                    <span className="text-lg mb-2 block">➕</span>
                    <p className="text-sm font-medium">Nueva Factura</p>
                  </button>
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className="bg-secondary text-secondary-foreground p-4 rounded-lg hover:bg-secondary/90 transition-colors text-left"
                    data-testid="quick-action-search-order"
                  >
                    <span className="text-lg mb-2 block">🔍</span>
                    <p className="text-sm font-medium">Buscar Orden</p>
                  </button>
                  <button 
                    onClick={() => setActiveTab('cash-closure')}
                    className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors text-left"
                    data-testid="quick-action-cash-closure"
                  >
                    <span className="text-lg mb-2 block">💰</span>
                    <p className="text-sm font-medium">Cierre de Caja</p>
                  </button>
                  <button 
                    onClick={() => setActiveTab('services')}
                    className="bg-yellow-600 text-white p-4 rounded-lg hover:bg-yellow-700 transition-colors text-left"
                    data-testid="quick-action-configure"
                  >
                    <span className="text-lg mb-2 block">⚙️</span>
                    <p className="text-sm font-medium">Configurar</p>
                  </button>
                </div>
              </div>

              <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                <h3 className="text-lg font-semibold text-card-foreground mb-4">Órdenes Recientes</h3>
                <div className="space-y-3">
                  {recentOrders.map((order: Invoice) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium text-card-foreground" data-testid={`recent-order-${order.id}`}>
                          {order.number}
                        </p>
                        <p className="text-sm text-muted-foreground">{order.customerName}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusClasses(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                        <p className="text-sm font-medium text-card-foreground mt-1">
                          RD${parseFloat(order.total).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Navigation */}
      <nav className="w-64 bg-card shadow-sm border-r border-border flex flex-col">
        {/* Header in Sidebar */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-md">
              <FileText className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-card-foreground">Billtracky</h1>
              <p className="text-sm text-muted-foreground">CleanWash Lavandería</p>
            </div>
          </div>
        </div>
        
        {/* Navigation Menu */}
        <div className="flex-1 p-4">
          <div className="space-y-2">
            <button 
              onClick={() => setActiveTab('overview')} 
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'overview' 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:bg-muted hover:text-card-foreground'
              }`}
              data-testid="tab-overview"
            >
              <Home className="w-4 h-4 mr-3" />
              Dashboard
            </button>
            
            <button 
              onClick={() => setActiveTab('invoices')} 
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'invoices' 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:bg-muted hover:text-card-foreground'
              }`}
              data-testid="tab-invoices"
            >
              <FileText className="w-4 h-4 mr-3" />
              Nueva Factura
            </button>
            
            <button 
              onClick={() => setActiveTab('orders')} 
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'orders' 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:bg-muted hover:text-card-foreground'
              }`}
              data-testid="tab-orders"
            >
              <Package className="w-4 h-4 mr-3" />
              Órdenes
            </button>
            
            <button 
              onClick={() => setActiveTab('cash-closure')} 
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'cash-closure' 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:bg-muted hover:text-card-foreground'
              }`}
              data-testid="tab-cash-closure"
            >
              <BarChart3 className="w-4 h-4 mr-3" />
              Cierre de Caja
            </button>
            
            <button 
              onClick={() => setActiveTab('services')} 
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'services' 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:bg-muted hover:text-card-foreground'
              }`}
              data-testid="tab-services"
            >
              <Settings className="w-4 h-4 mr-3" />
              Servicios
            </button>
            
            <button 
              onClick={() => setActiveTab('payment-methods')} 
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'payment-methods' 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:bg-muted hover:text-card-foreground'
              }`}
              data-testid="tab-payment-methods"
            >
              <CreditCard className="w-4 h-4 mr-3" />
              Métodos de Pago
            </button>
            
            <button 
              onClick={() => setActiveTab('customers')} 
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'customers' 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:bg-muted hover:text-card-foreground'
              }`}
              data-testid="tab-customers"
            >
              <Users className="w-4 h-4 mr-3" />
              Clientes
            </button>
          </div>
        </div>
        
        {/* User Info and Logout */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-left">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full pulse-animation"></div>
                  <span className="text-xs text-green-600 font-medium">En línea</span>
                </div>
                <p className="text-sm font-medium text-card-foreground" data-testid="user-name">
                  {user.name}
                </p>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                  user.role === 'manager' ? 'bg-secondary/10 text-secondary' : 
                  'bg-green-100 text-green-800'
                }`}>
                  {user.role === 'manager' ? 'Gerente' : 
                   user.role === 'supervisor' ? 'Supervisor' : 'Empleado'}
                </span>
              </div>
            </div>
            
            <button
              onClick={onLogout}
              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              title="Cerrar sesión"
              data-testid="button-logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        {renderTabContent()}
      </main>
    </div>
  );
}
