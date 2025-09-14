import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  BarChart3, 
  DollarSign, 
  FileText, 
  Printer, 
  Download, 
  CheckCircle,
  Clock,
  CreditCard,
  Banknote,
  Landmark,
  Users,
  Phone,
  ArrowLeft,
  Calendar,
  Loader2,
  Calculator,
  Save,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Edit,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import type { Invoice, Employee, PaymentMethod } from '@shared/schema';

// Interfaces específicas para el cierre de caja
interface PaymentSummary {
  [key: string]: {
    quantity: number;
    total: number;
  };
}

interface EmployeeStats {
  [employeeName: string]: {
    sales: number;
    total: number;
  };
}

interface DailySummary {
  totalInvoices: number;
  deliveredInvoices: number;
  pendingInvoices: number;
  totalRevenue: number;
  totalSubtotal: number;
  totalTax: number;
  totalItems: number;
  urgentOrders: number;
  paymentSummary: PaymentSummary;
  employeeStats: EmployeeStats;
}

interface CashClosureProps {
  onBack: () => void;
}

export default function CashClosure({ onBack }: CashClosureProps) {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [openingCash, setOpeningCash] = useState<string>('5000');
  const [countedCash, setCountedCash] = useState<string>('0');
  const [notes, setNotes] = useState<string>('');
  const [showCashForm, setShowCashForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener datos de facturas para la fecha seleccionada
  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ['/api/invoices', selectedDate],
    queryFn: async () => {
      const response = await fetch('/api/invoices', {
        headers: {
          'x-employee-id': localStorage.getItem('employeeId') || '',
        },
      });
      if (!response.ok) throw new Error('Error al cargar facturas');
      const data = await response.json();
      
      // Filtrar por fecha seleccionada
      return data.filter((invoice: Invoice) => {
        if (!invoice.date) return false;
        const invoiceDate = new Date(invoice.date).toISOString().split('T')[0];
        return invoiceDate === selectedDate;
      });
    },
  });

  // Obtener métodos de pago
  const { data: paymentMethods = [], isLoading: paymentMethodsLoading } = useQuery({
    queryKey: ['/api/payment-methods'],
    queryFn: async () => {
      const response = await fetch('/api/payment-methods', {
        headers: {
          'x-employee-id': localStorage.getItem('employeeId') || '',
        },
      });
      if (!response.ok) throw new Error('Error al cargar métodos de pago');
      return response.json();
    },
  });

  // Obtener empleados
  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ['/api/employees'],
    queryFn: async () => {
      const response = await fetch('/api/employees', {
        headers: {
          'x-employee-id': localStorage.getItem('employeeId') || '',
        },
      });
      if (!response.ok) throw new Error('Error al cargar empleados');
      return response.json();
    },
  });

  // Obtener cierre de caja existente para la fecha seleccionada
  const { data: existingClosure, isLoading: closureLoading, refetch: refetchClosure } = useQuery({
    queryKey: ['/api/cash-closures/by-date', selectedDate],
    queryFn: async () => {
      const response = await fetch(`/api/cash-closures/by-date/${selectedDate}`, {
        headers: {
          'x-employee-id': localStorage.getItem('employeeId') || '',
        },
      });
      if (response.status === 404) return null;
      if (!response.ok) throw new Error('Error al cargar cierre de caja');
      return response.json();
    },
    enabled: !!selectedDate,
  });

  // Mutación para crear cierre de caja
  const createCashClosureMutation = useMutation({
    mutationFn: async (data: { closingDate: string; openingCash: number; countedCash: number; notes?: string }) => {
      const response = await fetch('/api/cash-closures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-employee-id': localStorage.getItem('employeeId') || '',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear cierre de caja');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "✅ Cierre de caja creado",
        description: "El cierre de caja se ha registrado correctamente",
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cash-closures/by-date', selectedDate] });
      refetchClosure();
      setShowCashForm(false);
      setCountedCash('0');
      setNotes('');
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Error al crear cierre",
        description: error.message,
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  // Calcular resumen diario
  const dailySummary: DailySummary = useMemo(() => {
    const deliveredInvoices = invoices.filter((invoice: Invoice) => 
      invoice.status === 'delivered' && invoice.paid
    );
    
    const pendingInvoices = invoices.filter((invoice: Invoice) => 
      !invoice.paid && invoice.status !== 'cancelled'
    );

    // Resumen por método de pago
    const paymentSummary: PaymentSummary = {};
    paymentMethods.forEach((method: PaymentMethod) => {
      paymentSummary[method.name] = { quantity: 0, total: 0 };
    });
    paymentSummary['Pendiente'] = { quantity: 0, total: 0 };

    deliveredInvoices.forEach((invoice: Invoice) => {
      const methodName = paymentMethods.find((m: PaymentMethod) => m.code === invoice.paymentMethod)?.name || 'Pendiente';
      if (paymentSummary[methodName]) {
        paymentSummary[methodName].quantity++;
        paymentSummary[methodName].total += parseFloat(invoice.total);
      }
    });

    // Estadísticas por empleado
    const employeeStats: EmployeeStats = {};
    deliveredInvoices.forEach((invoice: Invoice) => {
      const employee = employees.find((e: Employee) => e.id === invoice.employeeId);
      const employeeName = employee?.name || 'Desconocido';
      
      if (!employeeStats[employeeName]) {
        employeeStats[employeeName] = { sales: 0, total: 0 };
      }
      employeeStats[employeeName].sales++;
      employeeStats[employeeName].total += parseFloat(invoice.total);
    });

    return {
      totalInvoices: invoices.length,
      deliveredInvoices: deliveredInvoices.length,
      pendingInvoices: pendingInvoices.length,
      totalRevenue: deliveredInvoices.reduce((sum: number, inv: Invoice) => sum + parseFloat(inv.total), 0),
      totalSubtotal: deliveredInvoices.reduce((sum: number, inv: Invoice) => sum + parseFloat(inv.subtotal), 0),
      totalTax: deliveredInvoices.reduce((sum: number, inv: Invoice) => sum + parseFloat(inv.tax), 0),
      totalItems: invoices.length, // Se podría mejorar con items reales
      urgentOrders: 0, // Se podría agregar campo urgente al schema
      paymentSummary,
      employeeStats,
    };
  }, [invoices, paymentMethods, employees]);

  // Calculate system cash
  const systemCash = useMemo(() => {
    if (!paymentMethods.length) return parseFloat(openingCash) || 0;
    
    // Find total cash payments
    const cashMethod = paymentMethods.find((m: PaymentMethod) => m.code === 'cash');
    if (!cashMethod) return parseFloat(openingCash) || 0;
    
    const cashPayments = dailySummary.paymentSummary[cashMethod.name];
    return (parseFloat(openingCash) || 0) + (cashPayments?.total || 0);
  }, [openingCash, dailySummary.paymentSummary, paymentMethods]);

  // Calcular varianza
  const variance = useMemo(() => {
    const counted = parseFloat(countedCash) || 0;
    return counted - systemCash;
  }, [countedCash, systemCash]);

  const formatCurrency = (amount: number): string => {
    return `RD$${amount.toFixed(2)}`;
  };

  const handleCreateCashClosure = () => {
    if (!countedCash || parseFloat(countedCash) < 0) {
      toast({
        title: "❌ Error de validación",
        description: "Debe ingresar el dinero contado físicamente",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    createCashClosureMutation.mutate({
      closingDate: selectedDate,
      openingCash: parseFloat(openingCash) || 0,
      countedCash: parseFloat(countedCash),
      notes: notes || undefined,
    });
  };

  const getPaymentMethodIcon = (methodCode: string) => {
    switch (methodCode) {
      case 'cash':
        return <Banknote className="w-4 h-4 text-green-600" />;
      case 'card':
        return <CreditCard className="w-4 h-4 text-blue-600" />;
      case 'transfer':
        return <Landmark className="w-4 h-4 text-indigo-600" />;
      case 'mobile_pay':
        return <Phone className="w-4 h-4 text-purple-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getPaymentMethodColor = (methodCode: string) => {
    switch (methodCode) {
      case 'cash':
        return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700';
      case 'card':
        return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700';
      case 'transfer':
        return 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700';
      case 'mobile_pay':
        return 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700';
      default:
        return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700';
    }
  };

  const escapeHtml = (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  const printCashClosure = () => {
    const currentEmployee = employees.find((e: Employee) => e.id === localStorage.getItem('employeeId'));
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    // Crear contenido HTML completo de forma más simple con escapado de seguridad
    const htmlContent = `
      <html>
        <head>
          <title>Cierre de Caja - ${escapeHtml(selectedDate)}</title>
          <style>
            body { 
              font-family: 'Courier New', monospace; 
              max-width: 350px; 
              margin: 0; 
              padding: 15px; 
              font-size: 12px;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #000; 
              padding-bottom: 10px; 
              margin-bottom: 15px; 
            }
            .section { 
              margin: 12px 0; 
              border-bottom: 1px dashed #ccc;
              padding-bottom: 8px;
            }
            .item { 
              display: flex; 
              justify-content: space-between; 
              margin: 3px 0; 
            }
            .total { 
              font-weight: bold; 
              font-size: 14px; 
              border-top: 2px solid #000; 
              padding-top: 8px; 
              margin-top: 10px; 
            }
            .subtitle {
              font-weight: bold;
              margin: 8px 0 4px 0;
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>BILLTRACKY LAVANDERÍA</h2>
            <h3>CIERRE DE CAJA</h3>
            <p>Fecha: ${escapeHtml(new Date(selectedDate).toLocaleDateString('es-DO'))}</p>
            <p>Empleado: ${escapeHtml(currentEmployee?.name || 'Desconocido')}</p>
            <p>Hora: ${new Date().toLocaleTimeString('es-DO')}</p>
          </div>
          
          <div class="section">
            <div class="subtitle">RESUMEN GENERAL</div>
            <div class="item"><span>Total Facturas:</span><span>${dailySummary.totalInvoices}</span></div>
            <div class="item"><span>Entregadas:</span><span>${dailySummary.deliveredInvoices}</span></div>
            <div class="item"><span>Pendientes:</span><span>${dailySummary.pendingInvoices}</span></div>
          </div>
          
          <div class="section">
            <div class="subtitle">MÉTODOS DE PAGO</div>
            ${Object.entries(dailySummary.paymentSummary)
              .filter(([_, data]) => data.quantity > 0)
              .map(([method, data]) => 
                `<div class="item"><span>${escapeHtml(method)} (${data.quantity}):</span><span>${escapeHtml(formatCurrency(data.total))}</span></div>`
              ).join('')}
          </div>
          
          <div class="section">
            <div class="subtitle">EMPLEADOS</div>
            ${Object.entries(dailySummary.employeeStats)
              .map(([employee, data]) => 
                `<div class="item"><span>${escapeHtml(employee)} (${data.sales}):</span><span>${escapeHtml(formatCurrency(data.total))}</span></div>`
              ).join('')}
          </div>
          
          <div class="total">
            <div class="item"><span>TOTAL INGRESOS:</span><span>${formatCurrency(dailySummary.totalRevenue)}</span></div>
            <div class="item"><span>Subtotal:</span><span>${formatCurrency(dailySummary.totalSubtotal)}</span></div>
            <div class="item"><span>ITBIS (18%):</span><span>${formatCurrency(dailySummary.totalTax)}</span></div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; font-size: 10px;">
            <p>Reporte generado por Billtracky</p>
            <p>${new Date().toLocaleString('es-DO')}</p>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
    
    setModalMessage('Cierre de caja enviado a impresora correctamente');
    setShowConfirmModal(true);
  };

  const exportToExcel = () => {
    // Crear CSV simple para exportación
    const csvData = [
      ['CIERRE DE CAJA', selectedDate],
      [],
      ['RESUMEN GENERAL'],
      ['Total Facturas', dailySummary.totalInvoices],
      ['Entregadas', dailySummary.deliveredInvoices],
      ['Pendientes', dailySummary.pendingInvoices],
      [],
      ['MÉTODOS DE PAGO'],
      ...Object.entries(dailySummary.paymentSummary)
        .filter(([_, data]) => data.quantity > 0)
        .map(([method, data]) => [method, data.quantity, data.total]),
      [],
      ['EMPLEADOS'],
      ...Object.entries(dailySummary.employeeStats)
        .map(([employee, data]) => [employee, data.sales, data.total]),
      [],
      ['TOTALES'],
      ['Total Ingresos', dailySummary.totalRevenue],
      ['Subtotal', dailySummary.totalSubtotal],
      ['ITBIS', dailySummary.totalTax],
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `cierre-caja-${selectedDate}.csv`);
    link.style.visibility = 'hidden';
    
    // Agregar al DOM de forma segura
    document.body.appendChild(link);
    
    try {
      link.click();
    } finally {
      // Cleanup seguro: verificar si el elemento aún está en el DOM antes de eliminarlo
      if (link.parentNode === document.body) {
        document.body.removeChild(link);
      }
      // Liberar la URL del blob para evitar memory leaks
      URL.revokeObjectURL(url);
    }
    
    setModalMessage('Reporte exportado correctamente');
    setShowConfirmModal(true);
  };

  if (invoicesLoading || paymentMethodsLoading || employeesLoading || closureLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-3" />
            <span className="text-lg dark:text-gray-200">Cargando datos del cierre...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header con diseño tech 3D mejorado */}
        <div className="tech-button-3d bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-2 border-slate-200 dark:border-slate-600 rounded-xl shadow-2xl backdrop-blur-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                size="sm"
                onClick={onBack}
                className="tech-button-3d bg-white border-2 border-slate-300 text-slate-700 dark:from-slate-500/20 dark:to-slate-600/20 dark:text-white dark:border-slate-500/30 rounded-lg shadow-sm p-3 hover:bg-slate-50 hover:border-slate-400 dark:hover:from-slate-400/30 dark:hover:to-slate-500/30 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:-translate-y-1 dark:backdrop-blur-sm font-bold mr-3"
                data-testid="button-back-cash-closure"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 rounded-xl flex items-center justify-center tech-glow shadow-xl transform hover:scale-105 transition-all duration-300">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">Cierre de Caja</h1>
                <p className="text-slate-600 dark:text-slate-300 font-semibold">Reportes y cálculos diarios profesionales</p>
              </div>
            </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Label htmlFor="fecha" className="text-sm font-medium dark:text-gray-300">
                    Fecha:
                  </Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-40"
                    data-testid="input-date-selector"
                  />
                </div>
                
                <Button
                  onClick={printCashClosure}
                  className="tech-button-3d bg-white border-2 border-cyan-300 text-cyan-700 dark:from-cyan-500/20 dark:to-blue-600/20 dark:text-white dark:border-cyan-500/30 rounded-lg shadow-sm p-3 hover:bg-cyan-50 hover:border-cyan-400 dark:hover:from-cyan-400/30 dark:hover:to-blue-500/30 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:-translate-y-1 dark:backdrop-blur-sm font-bold"
                  data-testid="button-print-closure"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir
                </Button>
                <Button
                  onClick={exportToExcel}
                  className="tech-button-3d bg-white border-2 border-purple-300 text-purple-700 dark:from-purple-500/20 dark:to-pink-600/20 dark:text-white dark:border-purple-500/30 rounded-lg shadow-sm p-3 hover:bg-purple-50 hover:border-purple-400 dark:hover:from-purple-400/30 dark:hover:to-pink-500/30 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:-translate-y-1 dark:backdrop-blur-sm font-bold"
                  data-testid="button-export-closure"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
        </div>

        {/* Estadísticas con diseño tech 3D */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="tech-button-3d bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-2 border-cyan-200 dark:border-cyan-500/50 rounded-xl shadow-2xl backdrop-blur-sm p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 mb-2">📊 Total Facturas</p>
                <p className="text-3xl font-black bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent" data-testid="stat-total-invoices">
                  {dailySummary.totalInvoices}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center tech-glow shadow-lg">
                <FileText className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="tech-button-3d bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-2 border-green-200 dark:border-green-500/50 rounded-xl shadow-2xl backdrop-blur-sm p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">✅ Entregadas</p>
                <p className="text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent" data-testid="stat-delivered-invoices">
                  {dailySummary.deliveredInvoices}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center tech-glow shadow-lg">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="tech-button-3d bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-2 border-yellow-200 dark:border-yellow-500/50 rounded-xl shadow-2xl backdrop-blur-sm p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400 mb-2">⏰ Pendientes</p>
                <p className="text-3xl font-black bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent" data-testid="stat-pending-invoices">
                  {dailySummary.pendingInvoices}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center tech-glow shadow-lg animate-pulse">
                <Clock className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="tech-button-3d bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-800/30 border-2 border-green-300 dark:border-green-500/50 rounded-xl shadow-2xl backdrop-blur-sm p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 tech-glow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">💰 Total Ingresos</p>
                <p className="text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent" data-testid="stat-total-revenue">
                  {formatCurrency(dailySummary.totalRevenue)}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center tech-glow shadow-lg animate-pulse">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Métodos de Pago con diseño tech-3D */}
          <div className="tech-button-3d bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-2 border-blue-200 dark:border-blue-500/50 rounded-xl shadow-2xl backdrop-blur-sm p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center tech-glow shadow-lg">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-black bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 bg-clip-text text-transparent">💳 Métodos de Pago</h3>
            </div>
            <div className="space-y-3">
                {Object.entries(dailySummary.paymentSummary)
                  .filter(([_, data]) => data.quantity > 0)
                  .map(([methodName, data]) => {
                    const method = paymentMethods.find((m: PaymentMethod) => m.name === methodName);
                    const methodCode = method?.code || 'pending';
                    
                    return (
                      <div key={methodName} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                            {getPaymentMethodIcon(methodCode)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{methodName}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{data.quantity} transacciones</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-white" data-testid={`payment-${methodCode}-total`}>
                            {formatCurrency(data.total)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
            </div>
          </div>

          {/* Rendimiento por Empleado con diseño tech-3D */}
          <div className="tech-button-3d bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-2 border-purple-200 dark:border-purple-500/50 rounded-xl shadow-2xl backdrop-blur-sm p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center tech-glow shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">👥 Rendimiento por Empleado</h3>
            </div>
            <div className="space-y-3">
                {Object.entries(dailySummary.employeeStats).map(([employeeName, stats]) => (
                  <div key={employeeName} className="tech-button-3d bg-gradient-to-r from-white to-slate-50 dark:from-slate-700/50 dark:to-slate-800/50 border border-slate-200 dark:border-slate-600/50 rounded-lg p-4 hover:border-purple-300 dark:hover:border-purple-500/50 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center tech-glow shadow-lg">
                        <span className="text-white font-black text-lg">
                          {employeeName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-800 dark:text-white text-lg">{employeeName}</p>
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">{stats.sales} ventas</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent" data-testid={`employee-${employeeName}-total`}>
                          {formatCurrency(stats.total)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {Object.keys(dailySummary.employeeStats).length === 0 && (
                  <div className="tech-button-3d bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 border-2 border-yellow-300 dark:border-yellow-500/50 rounded-lg p-6 text-center tech-glow animate-pulse">
                    <p className="text-yellow-800 dark:text-yellow-300 font-bold text-lg">⚠️ No hay ventas registradas para esta fecha</p>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Professional POS-Style Cash Closure Display */}
        {existingClosure && (
          <div className="max-w-4xl mx-auto mt-8">
            {/* Header - Shopify Style */}
            <div className="bg-white dark:bg-gray-800 rounded-t-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cierre de Caja</h2>
                      <p className="text-gray-600 dark:text-gray-400">{format(new Date(selectedDate), "dd 'de' MMMM, yyyy", { locale: es })}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Estado</p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      ✅ Completado
                    </span>
                  </div>
                </div>
              </div>

              {/* Opening Cash - Fixed Amount Style */}
              <div className="px-8 py-6 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">💰 Dinero de Apertura</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Monto inicial en caja</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="pos-opening-cash">
                      {formatCurrency(5000.00)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Methods Breakdown - POS Style */}
              <div className="px-8 py-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">💳 Desglose por Método de Pago</h3>
                <div className="space-y-4">
                  {Object.entries(dailySummary.paymentSummary).map(([method, data]) => {
                    const isEffectivo = method.toLowerCase() === 'cash' || method.toLowerCase() === 'efectivo';
                    return (
                      <div 
                        key={method} 
                        className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                          isEffectivo 
                            ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                            : 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isEffectivo 
                              ? 'bg-green-500 text-white' 
                              : 'bg-blue-500 text-white'
                          }`}>
                            {isEffectivo ? '💵' : '💳'}
                          </div>
                          <div>
                            <p className={`font-bold ${
                              isEffectivo 
                                ? 'text-green-800 dark:text-green-400' 
                                : 'text-blue-800 dark:text-blue-400'
                            }`}>
                              {method === 'cash' ? 'Efectivo' : 
                               method === 'tarjeta' ? 'Tarjeta' : 
                               method === 'tansferencia' ? 'Transferencia' : 
                               method}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {data.quantity} {data.quantity === 1 ? 'transacción' : 'transacciones'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-xl font-bold ${
                            isEffectivo 
                              ? 'text-green-700 dark:text-green-400' 
                              : 'text-blue-700 dark:text-blue-400'
                          }`} data-testid={`pos-payment-${method}`}>
                            {formatCurrency(data.total)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cash Summary - Shopify Style */}
              <div className="px-8 py-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">💰 Efectivo Esperado</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white" data-testid="pos-expected-cash">
                      {formatCurrency(parseFloat(existingClosure.systemCash || '0'))}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">🧮 Efectivo Contado</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white" data-testid="pos-counted-cash">
                      {formatCurrency(parseFloat(existingClosure.countedCash || '0'))}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">🔄 Diferencia</p>
                    <p className={`text-xl font-bold ${
                      parseFloat(existingClosure.variance || '0') >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`} data-testid="pos-variance">
                      {parseFloat(existingClosure.variance || '0') >= 0 ? '+' : ''}{formatCurrency(parseFloat(existingClosure.variance || '0'))}
                    </p>
                  </div>
                </div>
              </div>

              {/* Total Sales - Shopify POS Style */}
              <div className="px-8 py-6 bg-blue-600 dark:bg-blue-700 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">📊 Total de Ventas del Día</h3>
                    <p className="text-blue-100">Todas las transacciones incluidas</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold" data-testid="pos-total-sales">
                      {formatCurrency(dailySummary.totalRevenue)}
                    </p>
                    <p className="text-blue-100">{dailySummary.totalInvoices} {dailySummary.totalInvoices === 1 ? 'factura' : 'facturas'}</p>
                  </div>
                </div>
              </div>

              {/* Notes if exist */}
              {existingClosure.notes && (
                <div className="px-8 py-4 bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">📝</span>
                    </div>
                    <div>
                      <p className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">Observaciones</p>
                      <p className="text-yellow-700 dark:text-yellow-200" data-testid="pos-notes">{existingClosure.notes}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Shopify POS Cash Counting Form */}
        {!existingClosure && (
          <div className="max-w-4xl mx-auto mt-8">
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Cierre de Caja</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{format(new Date(selectedDate), "dd 'de' MMMM, yyyy", { locale: es })}</p>
                  </div>
                  <Button
                    onClick={() => setShowCashForm(!showCashForm)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded"
                    data-testid="button-toggle-cash-form"
                  >
                    {showCashForm ? 'Cancelar' : 'Iniciar Conteo'}
                  </Button>
                </div>
              </div>

              {!showCashForm ? (
                <div className="px-6 py-8 text-center bg-gray-50 dark:bg-gray-800">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-4 flex items-center justify-center">
                    <Calculator className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Conteo de Efectivo</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Registre el dinero físico en caja para completar el cierre del día
                  </p>
                  <Button
                    onClick={() => setShowCashForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-sm rounded"
                    data-testid="button-start-counting"
                  >
                    Iniciar Conteo
                  </Button>
                </div>
              ) : (
                <div className="p-8">
                  {/* Opening Cash - Editable */}
                  <div className="mb-6">
                    <div className="tech-button-3d bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-800/30 border-2 border-green-300 dark:border-green-500/50 rounded-lg p-6">
                      <Label htmlFor="opening-cash" className="text-sm font-bold text-green-700 dark:text-green-300 mb-3 flex items-center gap-2">
                        💰 Dinero de Apertura
                        <Badge className="bg-green-200 text-green-800 dark:bg-green-800/50 dark:text-green-200">Modificable</Badge>
                      </Label>
                      <Input
                        id="opening-cash"
                        type="number"
                        min="0"
                        step="0.01"
                        value={openingCash}
                        onChange={(e) => setOpeningCash(e.target.value)}
                        placeholder="5000.00"
                        className="text-lg font-bold tech-button-3d"
                        data-testid="input-opening-cash"
                      />
                      <p className="text-xs text-green-600 dark:text-green-400 mt-2">Dinero inicial en caja al abrir</p>
                      <div className="mt-4 p-3 bg-white dark:bg-green-900/20 rounded border border-green-200 dark:border-green-700">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-green-700 dark:text-green-400">+ Ventas en Efectivo:</span>
                          <span className="font-medium text-green-800 dark:text-green-300">
                            {formatCurrency((dailySummary.paymentSummary.cash?.total || 0))}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-green-200 dark:border-green-700">
                          <span className="font-semibold text-green-800 dark:text-green-300">= Total Esperado:</span>
                          <span className="font-bold text-green-900 dark:text-green-200">
                            {formatCurrency(systemCash)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Methods Summary - Shopify POS Style */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Resumen de Ventas</h3>
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
                      {Object.entries(dailySummary.paymentSummary).map(([method, data]) => {
                        return (
                          <div key={method} className="px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                                <span className="text-xs">
                                  {method === 'cash' || method.toLowerCase() === 'efectivo' ? '💵' : '💳'}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {method === 'cash' ? 'Efectivo' : 
                                   method === 'tarjeta' ? 'Tarjeta' : 
                                   method === 'tansferencia' ? 'Transferencia' : 
                                   method}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {data.quantity} transacciones
                                </p>
                              </div>
                            </div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(data.total)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cash Counting Input - Shopify POS Style */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Conteo de Efectivo</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Cash Counting Input */}
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <label htmlFor="counted-cash" className="text-xs text-gray-500 dark:text-gray-400 mb-2 block">
                          Dinero físico contado
                        </label>
                        <Input
                          id="counted-cash"
                          type="number"
                          min="0"
                          step="0.01"
                          value={countedCash}
                          onChange={(e) => setCountedCash(e.target.value)}
                          placeholder="0.00"
                          className="text-xl font-semibold text-center border-0 bg-transparent p-0 focus-visible:ring-0"
                          data-testid="input-counted-cash"
                        />
                      </div>
                      
                      {/* Expected Cash Display */}
                      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Efectivo esperado</p>
                        <p className="text-xl font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(systemCash)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Variance Display - Shopify POS Style */}
                  <div className="mb-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Diferencia</p>
                        <p className={`text-lg font-semibold ${
                          variance >= 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {variance >= 0 ? '+' : ''}{formatCurrency(variance)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          Math.abs(variance) < 10 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : Math.abs(variance) < 50 
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {Math.abs(variance) < 10 ? 'OK' : 
                           Math.abs(variance) < 50 ? 'ADVERTENCIA' : 
                           'REVISAR'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notes - Shopify POS Style */}
                  <div className="mb-6">
                    <label htmlFor="notes" className="text-xs text-gray-500 dark:text-gray-400 mb-2 block">
                      Observaciones (opcional)
                    </label>
                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Agregar observaciones..."
                      className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                      rows={3}
                      data-testid="input-notes"
                    />
                  </div>

                  {/* Action Buttons - Shopify POS Style */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      onClick={() => setShowCashForm(false)}
                      variant="ghost"
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      data-testid="button-cancel-closure"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleCreateCashClosure}
                      disabled={createCashClosureMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-sm font-medium"
                      data-testid="button-create-closure"
                    >
                      {createCashClosureMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        'Completar Cierre'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Financial Breakdown Section - Shopify POS style */}
        <div className="max-w-4xl mx-auto mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Resumen Financiero</h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Desglose completo de ingresos del día</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg text-center">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Subtotal</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white" data-testid="financial-subtotal">
                    {formatCurrency(dailySummary.totalSubtotal)}
                  </p>
                </div>
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg text-center">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">ITBIS (18%)</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white" data-testid="financial-tax">
                    {formatCurrency(dailySummary.totalTax)}
                  </p>
                </div>
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg text-center">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total Ingresos</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="financial-total">
                    {formatCurrency(dailySummary.totalRevenue)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Confirmation Modal */}
        <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
          <DialogContent className="max-w-md" data-testid="modal-confirmation">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Cierre de Caja
              </DialogTitle>
            </DialogHeader>
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6" data-testid="modal-message">{modalMessage}</p>
              <Button
                onClick={() => setShowConfirmModal(false)}
                className="w-full"
                data-testid="button-modal-accept"
              >
                Aceptar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}