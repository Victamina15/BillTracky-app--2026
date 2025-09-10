import { useState } from "react";
import { FileText, LogOut, Home, Package, Users, Settings } from "lucide-react";
import { type Employee, type Invoice } from "@shared/schema";
import InvoiceForm from "./invoice-form";
import OrdersTable from "./orders-table";
import CustomersGrid from "./customers-grid";
import ServicesConfig from "./services-config";
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

  const renderTabContent = () => {
    switch (activeTab) {
      case "invoices":
        return <InvoiceForm user={user} onNotification={onNotification} />;
      case "orders":
        return <OrdersTable onNotification={onNotification} />;
      case "customers":
        return <CustomersGrid onNotification={onNotification} />;
      case "services":
        return <ServicesConfig onNotification={onNotification} />;
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
                    onClick={() => onNotification("Generando reportes...")}
                    className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors text-left"
                    data-testid="quick-action-reports"
                  >
                    <span className="text-lg mb-2 block">🖨️</span>
                    <p className="text-sm font-medium">Reportes</p>
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
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          order.status === 'received' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'in_process' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'ready' ? 'bg-purple-100 text-purple-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {order.status === 'received' ? 'Recibido' :
                           order.status === 'in_process' ? 'En Proceso' :
                           order.status === 'ready' ? 'Listo' : 'Entregado'}
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-md">
              <FileText className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-card-foreground">Billtracky</h1>
              <p className="text-sm text-muted-foreground">CleanWash Lavandería</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-2 h-2 bg-green-500 rounded-full pulse-animation"></div>
                <span className="text-sm text-green-600 font-medium">En línea</span>
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
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-card border-b border-border px-6">
        <div className="flex space-x-1 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('overview')} 
            className={`tab-btn px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === 'overview' ? 'tab-active' : ''
            }`}
            data-testid="tab-overview"
          >
            <Home className="w-4 h-4 mr-2" />
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('orders')} 
            className={`tab-btn px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === 'orders' ? 'tab-active' : ''
            }`}
            data-testid="tab-orders"
          >
            <Package className="w-4 h-4 mr-2" />
            Órdenes
          </button>
          <button 
            onClick={() => setActiveTab('invoices')} 
            className={`tab-btn px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === 'invoices' ? 'tab-active' : ''
            }`}
            data-testid="tab-invoices"
          >
            <FileText className="w-4 h-4 mr-2" />
            Nueva Factura
          </button>
          <button 
            onClick={() => setActiveTab('customers')} 
            className={`tab-btn px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === 'customers' ? 'tab-active' : ''
            }`}
            data-testid="tab-customers"
          >
            <Users className="w-4 h-4 mr-2" />
            Clientes
          </button>
          <button 
            onClick={() => setActiveTab('services')} 
            className={`tab-btn px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === 'services' ? 'tab-active' : ''
            }`}
            data-testid="tab-services"
          >
            <Settings className="w-4 h-4 mr-2" />
            Servicios
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6">
        {renderTabContent()}
      </main>
    </div>
  );
}
