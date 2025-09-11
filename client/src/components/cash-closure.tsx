import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  Loader2
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
  const { toast } = useToast();

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

  const formatCurrency = (amount: number): string => {
    return `RD$${amount.toFixed(2)}`;
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
        return 'bg-green-50 text-green-700 border-green-200';
      case 'card':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'transfer':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'mobile_pay':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
  };

  const printCashClosure = () => {
    const currentEmployee = employees.find((e: Employee) => e.id === localStorage.getItem('employeeId'));
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    // Crear contenido HTML completo de forma más simple
    const htmlContent = `
      <html>
        <head>
          <title>Cierre de Caja - ${selectedDate}</title>
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
            <p>Fecha: ${new Date(selectedDate).toLocaleDateString('es-DO')}</p>
            <p>Empleado: ${currentEmployee?.name || 'Desconocido'}</p>
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
                `<div class="item"><span>${method} (${data.quantity}):</span><span>${formatCurrency(data.total)}</span></div>`
              ).join('')}
          </div>
          
          <div class="section">
            <div class="subtitle">EMPLEADOS</div>
            ${Object.entries(dailySummary.employeeStats)
              .map(([employee, data]) => 
                `<div class="item"><span>${employee} (${data.sales}):</span><span>${formatCurrency(data.total)}</span></div>`
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

  if (invoicesLoading || paymentMethodsLoading || employeesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-3" />
            <span className="text-lg">Cargando datos del cierre...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onBack}
                className="mr-3"
                data-testid="button-back-cash-closure"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Cierre de Caja</h1>
                <p className="text-gray-600">Reportes y cálculos diarios</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <Label htmlFor="fecha" className="text-sm font-medium">
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
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
                data-testid="button-print-closure"
              >
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
              <Button
                onClick={exportToExcel}
                className="bg-green-50 hover:bg-green-100 text-green-700 border border-green-200"
                data-testid="button-export-closure"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>

        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Facturas</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="stat-total-invoices">
                    {dailySummary.totalInvoices}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Entregadas</p>
                  <p className="text-2xl font-bold text-green-600" data-testid="stat-delivered-invoices">
                    {dailySummary.deliveredInvoices}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600" data-testid="stat-pending-invoices">
                    {dailySummary.pendingInvoices}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Ingresos</p>
                  <p className="text-2xl font-bold text-green-600" data-testid="stat-total-revenue">
                    {formatCurrency(dailySummary.totalRevenue)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resumen por métodos de pago */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Métodos de Pago
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(dailySummary.paymentSummary)
                  .filter(([_, data]) => data.quantity > 0)
                  .map(([methodName, data]) => {
                    const method = paymentMethods.find((m: PaymentMethod) => m.name === methodName);
                    const methodCode = method?.code || 'pending';
                    
                    return (
                      <div key={methodName} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          {getPaymentMethodIcon(methodCode)}
                          <div>
                            <p className="font-medium">{methodName}</p>
                            <p className="text-sm text-gray-600">{data.quantity} transacciones</p>
                          </div>
                        </div>
                        <Badge className={getPaymentMethodColor(methodCode)} data-testid={`payment-${methodCode}-total`}>
                          {formatCurrency(data.total)}
                        </Badge>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas por empleado */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Rendimiento por Empleado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(dailySummary.employeeStats).map(([employeeName, stats]) => (
                  <div key={employeeName} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">{employeeName}</p>
                      <p className="text-sm text-gray-600">{stats.sales} ventas</p>
                    </div>
                    <Badge className="bg-blue-50 text-blue-700 border-blue-200" data-testid={`employee-${employeeName}-total`}>
                      {formatCurrency(stats.total)}
                    </Badge>
                  </div>
                ))}
                {Object.keys(dailySummary.employeeStats).length === 0 && (
                  <p className="text-center text-gray-500 py-4">No hay ventas registradas para esta fecha</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Desglose financiero */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Desglose Financiero
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Subtotal</p>
                <p className="text-xl font-bold text-green-600" data-testid="financial-subtotal">
                  {formatCurrency(dailySummary.totalSubtotal)}
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">ITBIS (18%)</p>
                <p className="text-xl font-bold text-blue-600" data-testid="financial-tax">
                  {formatCurrency(dailySummary.totalTax)}
                </p>
              </div>
              <div className="text-center p-4 bg-green-100 rounded-lg border-2 border-green-200">
                <p className="text-sm text-gray-600 mb-1">Total Ingresos</p>
                <p className="text-2xl font-bold text-green-700" data-testid="financial-total">
                  {formatCurrency(dailySummary.totalRevenue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal de confirmación */}
        <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
          <DialogContent className="max-w-md" data-testid="modal-confirmation">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Cierre de Caja
              </DialogTitle>
            </DialogHeader>
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-gray-600 mb-6" data-testid="modal-message">{modalMessage}</p>
              <Button
                onClick={() => setShowConfirmModal(false)}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
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