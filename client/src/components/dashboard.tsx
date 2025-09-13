import { useState } from "react";
import { FileText, LogOut, Home, Package, Users, Settings, CreditCard, BarChart3, Building2, MessageCircle, Menu, X, CheckCircle } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { type Employee, type Invoice } from "@shared/schema";
import InvoiceCreation from "./invoice-creation";
import OrderManagement from "./order-management";
import CustomersGrid from "./customers-grid";
import ServicesConfig from "./services-config";
import PaymentMethodsConfig from "./payment-methods-config";
import CashClosure from "./cash-closure";
import CompanyConfig from "./company-config";
import WhatsAppConfig from "./whatsapp-config";
import { useQuery } from "@tanstack/react-query";

interface DashboardProps {
  user: Employee;
  onLogout: () => void;
  onNotification: (message: string) => void;
}

export default function Dashboard({ user, onLogout, onNotification }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  // Helper functions para obtener clases de estado con colores pasteles profesionales
  const getStatusClasses = (status: string | null) => {
    // Pastel colors with dark text for AA contrast + professional appearance
    if (!status) return 'bg-slate-200 text-slate-800 border border-slate-300 px-2 py-1 text-xs font-semibold rounded-full';
    
    switch(status) {
      case 'received': return 'bg-sky-200 text-sky-800 border border-sky-300 px-2 py-1 text-xs font-semibold rounded-full';
      case 'in_process': return 'bg-amber-200 text-amber-800 border border-amber-300 px-2 py-1 text-xs font-semibold rounded-full'; 
      case 'ready': return 'bg-violet-200 text-violet-800 border border-violet-300 px-2 py-1 text-xs font-semibold rounded-full';
      case 'delivered': return 'bg-emerald-200 text-emerald-800 border border-emerald-300 px-2 py-1 text-xs font-semibold rounded-full';
      case 'cancelled': return 'bg-rose-200 text-rose-800 border border-rose-300 px-2 py-1 text-xs font-semibold rounded-full';
      default: return 'bg-slate-200 text-slate-800 border border-slate-300 px-2 py-1 text-xs font-semibold rounded-full';
    }
  };

  const getStatusText = (status: string | null) => {
    if (!status) return 'Desconocido';
    
    switch(status) {
      case 'received': return 'Recibido';
      case 'in_process': return 'En Proceso';
      case 'ready': return 'Listo para Entrega';
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
      case "company-config":
        return <CompanyConfig onBack={() => setActiveTab('overview')} />;
      case "whatsapp-config":
        return <WhatsAppConfig onBack={() => setActiveTab('overview')} />;
      default:
        return (
          <div>
            {/* Metrics Cards - Vivos y Profesionales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow-sm border border-slate-200 dark:border-cyan-500/20 border-l-4 border-l-sky-300 p-6 dark:backdrop-blur-sm hover:shadow-lg dark:hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-cyan-300">Órdenes Hoy</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white" data-testid="metric-today-orders">
                      {metricsLoading ? "..." : metrics?.todayOrders || 0}
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">+3 desde ayer</p>
                  </div>
                  <div className="w-12 h-12 bg-sky-200 dark:from-cyan-400/20 dark:to-purple-500/20 rounded-xl flex items-center justify-center text-sky-700 shadow-sm">
                    <Package className="w-6 h-6" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow-sm border border-slate-200 dark:border-cyan-500/20 border-l-4 border-l-emerald-300 p-6 dark:backdrop-blur-sm hover:shadow-lg dark:hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-emerald-300">Ingresos Hoy</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white" data-testid="metric-today-revenue">
                      {metricsLoading ? "..." : `RD$${metrics?.todayRevenue || "0.00"}`}
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-green-400 mt-1 font-medium">+15% vs ayer</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-200 dark:from-green-400/20 dark:to-cyan-500/20 rounded-xl flex items-center justify-center text-emerald-700 shadow-sm">
                    <span className="text-lg font-bold">$</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow-sm border border-slate-200 dark:border-cyan-500/20 border-l-4 border-l-violet-300 p-6 dark:backdrop-blur-sm hover:shadow-lg dark:hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-purple-300">Listo para Entrega</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white" data-testid="metric-in-progress">
                      {metricsLoading ? "..." : metrics?.inProgress || 0}
                    </p>
                    <p className="text-xs text-violet-600 dark:text-purple-400 mt-1 font-medium">💬 WhatsApp automático</p>
                  </div>
                  <div className="w-12 h-12 bg-violet-200 dark:from-yellow-400/20 dark:to-orange-500/20 rounded-xl flex items-center justify-center text-violet-700 shadow-sm">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow-sm border border-slate-200 dark:border-cyan-500/20 border-l-4 border-l-rose-300 p-6 dark:backdrop-blur-sm hover:shadow-lg dark:hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-rose-300">Pendientes Pago</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white" data-testid="metric-pending-payment">
                      {metricsLoading ? "..." : metrics?.pendingPayment || 0}
                    </p>
                    <p className="text-xs text-rose-600 dark:text-red-400 mt-1 font-medium">
                      RD${metrics?.pendingPaymentTotal || "0.00"} total
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-rose-200 dark:from-red-400/20 dark:to-pink-500/20 rounded-xl flex items-center justify-center text-rose-700 shadow-sm">
                    <CreditCard className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions and Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow-sm border border-slate-200 dark:border-cyan-500/20 p-6 dark:backdrop-blur-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white tech-text-glow mb-4">Acciones Rápidas</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setActiveTab('invoices')}
                    className="tech-button-3d bg-white border-2 border-sky-300 text-sky-700 dark:from-cyan-500/20 dark:to-blue-600/20 dark:text-white p-4 rounded-lg hover:bg-sky-50 hover:border-sky-400 dark:hover:from-cyan-400/30 dark:hover:to-blue-500/30 transition-all duration-300 text-left shadow-lg hover:shadow-xl transform hover:scale-105"
                    data-testid="quick-action-new-invoice"
                  >
                    <span className="text-lg mb-2 block">➕</span>
                    <p className="text-sm font-bold">Nueva Factura</p>
                  </button>
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className="tech-button-3d bg-white border-2 border-violet-300 text-violet-700 dark:from-purple-500/20 dark:to-pink-600/20 dark:text-white p-4 rounded-lg hover:bg-violet-50 hover:border-violet-400 dark:hover:from-purple-400/30 dark:hover:to-pink-500/30 transition-all duration-300 text-left shadow-lg hover:shadow-xl transform hover:scale-105"
                    data-testid="quick-action-search-order"
                  >
                    <span className="text-lg mb-2 block">🔍</span>
                    <p className="text-sm font-bold">Buscar Orden</p>
                  </button>
                  <button 
                    onClick={() => setActiveTab('cash-closure')}
                    className="tech-button-3d bg-white border-2 border-emerald-300 text-emerald-700 dark:from-green-500/20 dark:to-emerald-600/20 dark:text-white p-4 rounded-lg hover:bg-emerald-50 hover:border-emerald-400 dark:hover:from-green-400/30 dark:hover:to-emerald-500/30 transition-all duration-300 text-left shadow-lg hover:shadow-xl transform hover:scale-105"
                    data-testid="quick-action-cash-closure"
                  >
                    <span className="text-lg mb-2 block">💰</span>
                    <p className="text-sm font-bold">Cierre de Caja</p>
                  </button>
                  <button 
                    onClick={() => setActiveTab('services')}
                    className="tech-button-3d bg-white border-2 border-amber-300 text-amber-700 dark:from-yellow-500/20 dark:to-orange-600/20 dark:text-white p-4 rounded-lg hover:bg-amber-50 hover:border-amber-400 dark:hover:from-yellow-400/30 dark:hover:to-orange-500/30 transition-all duration-300 text-left shadow-lg hover:shadow-xl transform hover:scale-105"
                    data-testid="quick-action-configure"
                  >
                    <span className="text-lg mb-2 block">⚙️</span>
                    <p className="text-sm font-bold">Configurar</p>
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow-sm border border-slate-200 dark:border-cyan-500/20 p-6 dark:backdrop-blur-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white tech-text-glow mb-4">Órdenes Recientes</h3>
                <div className="space-y-3">
                  {recentOrders.map((order: Invoice) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-white dark:bg-muted rounded-lg border border-slate-200 dark:border-transparent hover:bg-slate-50 dark:hover:bg-muted/80 hover:shadow-md transition-all duration-200">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white" data-testid={`recent-order-${order.id}`}>
                          {order.number}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-gray-300">{order.customerName}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block ${getStatusClasses(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                        <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
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
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden tech-button-3d p-2 rounded-lg bg-card border border-border"
        aria-expanded={sidebarOpen}
        aria-label={sidebarOpen ? "Cerrar menú" : "Abrir menú"}
        data-testid="hamburger-menu"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar Navigation */}
      <nav className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } fixed lg:relative lg:translate-x-0 w-64 h-full bg-gradient-to-b from-gray-900 via-purple-900/20 to-blue-900/20 backdrop-blur-xl border-r border-cyan-500/20 flex flex-col z-40 transition-transform duration-300 lg:transition-none tech-gradient-bg`}>
        {/* Header in Sidebar */}
        <div className="p-6 border-b border-cyan-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center dark:shadow-lg tech-glow">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tech-text-glow">Billtracky</h1>
                <p className="text-sm text-cyan-200">CleanWash Lavandería</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
        
        {/* Navigation Menu */}
        <div className="flex-1 p-4">
          <div className="space-y-2">
            <button 
              onClick={() => setActiveTab('overview')} 
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
                activeTab === 'overview' 
                  ? 'tech-button-3d tech-button-active text-cyan-400 dark:shadow-lg' 
                  : 'tech-button-3d text-gray-300 hover:text-cyan-400'
              }`}
              data-testid="tab-overview"
            >
              <Home className="w-4 h-4 mr-3" />
              Dashboard
            </button>
            
            <button 
              onClick={() => setActiveTab('invoices')} 
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
                activeTab === 'invoices' 
                  ? 'tech-button-3d tech-button-active text-cyan-400 dark:shadow-lg' 
                  : 'tech-button-3d text-gray-300 hover:text-cyan-400'
              }`}
              data-testid="tab-invoices"
            >
              <FileText className="w-4 h-4 mr-3" />
              Nueva Factura
            </button>
            
            <button 
              onClick={() => setActiveTab('orders')} 
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
                activeTab === 'orders' 
                  ? 'tech-button-3d tech-button-active text-cyan-400 dark:shadow-lg' 
                  : 'tech-button-3d text-gray-300 hover:text-cyan-400'
              }`}
              data-testid="tab-orders"
            >
              <Package className="w-4 h-4 mr-3" />
              Órdenes
            </button>
            
            <button 
              onClick={() => setActiveTab('cash-closure')} 
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
                activeTab === 'cash-closure' 
                  ? 'tech-button-3d tech-button-active text-cyan-400 dark:shadow-lg' 
                  : 'tech-button-3d text-gray-300 hover:text-cyan-400'
              }`}
              data-testid="tab-cash-closure"
            >
              <BarChart3 className="w-4 h-4 mr-3" />
              Cierre de Caja
            </button>
            
            <button 
              onClick={() => setActiveTab('services')} 
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
                activeTab === 'services' 
                  ? 'tech-button-3d tech-button-active text-cyan-400 dark:shadow-lg' 
                  : 'tech-button-3d text-gray-300 hover:text-cyan-400'
              }`}
              data-testid="tab-services"
            >
              <Settings className="w-4 h-4 mr-3" />
              Servicios
            </button>
            
            <button 
              onClick={() => setActiveTab('payment-methods')} 
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
                activeTab === 'payment-methods' 
                  ? 'tech-button-3d tech-button-active text-cyan-400 dark:shadow-lg' 
                  : 'tech-button-3d text-gray-300 hover:text-cyan-400'
              }`}
              data-testid="tab-payment-methods"
            >
              <CreditCard className="w-4 h-4 mr-3" />
              Métodos de Pago
            </button>
            
            <button 
              onClick={() => setActiveTab('customers')} 
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
                activeTab === 'customers' 
                  ? 'tech-button-3d tech-button-active text-cyan-400 dark:shadow-lg' 
                  : 'tech-button-3d text-gray-300 hover:text-cyan-400'
              }`}
              data-testid="tab-customers"
            >
              <Users className="w-4 h-4 mr-3" />
              Clientes
            </button>
            
            <button 
              onClick={() => setActiveTab('company-config')} 
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
                activeTab === 'company-config' 
                  ? 'tech-button-3d tech-button-active text-cyan-400 dark:shadow-lg' 
                  : 'tech-button-3d text-gray-300 hover:text-cyan-400'
              }`}
              data-testid="tab-company-config"
            >
              <Building2 className="w-4 h-4 mr-3" />
              Configuración Empresa
            </button>
            
            <button 
              onClick={() => setActiveTab('whatsapp-config')} 
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
                activeTab === 'whatsapp-config' 
                  ? 'tech-button-3d tech-button-active text-cyan-400 dark:shadow-lg' 
                  : 'tech-button-3d text-gray-300 hover:text-cyan-400'
              }`}
              data-testid="tab-whatsapp-config"
            >
              <MessageCircle className="w-4 h-4 mr-3" />
              Mensajes WhatsApp
            </button>
          </div>
        </div>
        
        {/* User Info and Logout */}
        <div className="p-4 border-t border-cyan-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-left">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full pulse-animation tech-glow"></div>
                  <span className="text-xs text-green-400 font-medium">En línea</span>
                </div>
                <p className="text-sm font-medium text-white" data-testid="user-name">
                  {user.name}
                </p>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                  user.role === 'manager' ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/30' : 
                  'bg-purple-400/20 text-purple-400 border border-purple-400/30'
                }`}>
                  {user.role === 'manager' ? 'Gerente' : 
                   user.role === 'supervisor' ? 'Supervisor' : 'Empleado'}
                </span>
              </div>
            </div>
            
            <button
              onClick={onLogout}
              className="tech-button-3d p-2 text-gray-300 hover:text-red-400 rounded-lg transition-all duration-300"
              title="Cerrar sesión"
              data-testid="button-logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 dark:backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          data-testid="sidebar-overlay"
        />
      )}

      {/* Main Content */}
      <main className={`flex-1 p-6 overflow-auto transition-all duration-300 ${
        sidebarOpen && 'lg:ml-0'
      }`}>
        {renderTabContent()}
      </main>
    </div>
  );
}
