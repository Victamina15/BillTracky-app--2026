import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  FileText,
  Plus,
  Trash2,
  DollarSign,
  Calendar,
  User,
  Phone,
  Mail,
  Search,
  X,
  Clock,
  Check,
  Users,
  CreditCard,
  Banknote,
  Landmark,
  Calculator,
  Percent,
  Minus,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { 
  Customer, 
  Service, 
  PaymentMethod, 
  Invoice, 
  InvoiceItem,
  InsertInvoice, 
  InsertInvoiceItem,
  InsertCustomer 
} from '@shared/schema';

// Helper function for authenticated API requests
async function authenticatedRequest(url: string, method: string, data?: any) {
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-employee-id': localStorage.getItem('employeeId') || '',
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: 'include',
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    let errorMessage;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorText;
    } catch {
      errorMessage = errorText || res.statusText;
    }
    throw new Error(errorMessage);
  }
  
  return res.json();
}

// Form schemas
const invoiceFormSchema = z.object({
  customerName: z.string().min(1, 'El nombre del cliente es requerido'),
  customerPhone: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos'),
  customerEmail: z.string().email('Email inválido').optional().or(z.literal('')),
  deliveryDate: z.string().optional(),
});

const itemFormSchema = z.object({
  serviceId: z.string().min(1, 'Seleccione un servicio'),
  serviceType: z.enum(['wash', 'iron', 'both']),
  quantity: z.number().min(1, 'La cantidad debe ser al menos 1'),
});

type InvoiceFormData = z.infer<typeof invoiceFormSchema>;
type ItemFormData = z.infer<typeof itemFormSchema>;

interface InvoiceCreationProps {
  onNotification: (message: string) => void;
}

interface InvoiceItemWithService extends InvoiceItem {
  service?: Service;
}

interface CurrentInvoice {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryDate: string;
  items: InvoiceItemWithService[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethodId: string;
}

export default function InvoiceCreation({ onNotification }: InvoiceCreationProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Estado local
  const [currentInvoice, setCurrentInvoice] = useState<CurrentInvoice>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    deliveryDate: '',
    items: [],
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
    paymentMethodId: '',
  });

  // Estados de modales
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCustomerSearchModal, setShowCustomerSearchModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedDeliveryDate, setSelectedDeliveryDate] = useState('');
  
  // Estados de descuento
  const [discountData, setDiscountData] = useState({
    type: 'amount' as 'amount' | 'percentage',
    value: 0,
    reason: ''
  });

  // Búsqueda de clientes
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');

  // Formularios
  const invoiceForm = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      deliveryDate: '',
    },
  });

  // Queries para datos
  const { data: customers = [], isLoading: customersLoading } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
    retry: 2,
  });

  const { data: services = [], isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: ['/api/services'],
    retry: 2,
  });

  const { data: paymentMethods = [], isLoading: paymentMethodsLoading } = useQuery<PaymentMethod[]>({
    queryKey: ['/api/payment-methods'],
    retry: 2,
  });

  // Generar número de factura
  const { data: nextInvoiceNumber } = useQuery<{ number: string }>({
    queryKey: ['/api/invoices/next-number'],
    retry: 2,
  });

  // Mutación para crear factura
  const createInvoiceMutation = useMutation({
    mutationFn: async (payload: { invoice: InsertInvoice, items: InsertInvoiceItem[] }) =>
      authenticatedRequest('/api/invoices', 'POST', payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      
      toast({
        title: "Factura creada exitosamente",
        description: `Factura ${data.invoice.number} por ${formatCurrency(data.invoice.total)} ha sido creada.`,
      });

      // Resetear formulario
      resetForm();
      setShowPaymentModal(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error al crear factura",
        description: error.message || "No se pudo crear la factura",
        variant: "destructive",
      });
    },
  });

  // Funciones utilitarias
  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `RD$${num.toFixed(2)}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('es-DO');
  };

  // Calcular totales
  const calculateTotals = (items: InvoiceItemWithService[], discount = currentInvoice.discount) => {
    const subtotal = items.reduce((acc, item) => {
      const itemTotal = parseFloat(item.total || '0');
      return acc + itemTotal;
    }, 0);
    
    const discountAmount = discountData.type === 'percentage' 
      ? subtotal * (discount / 100)
      : discount;
    
    const subtotalWithDiscount = subtotal - discountAmount;
    const tax = subtotalWithDiscount * 0.18; // ITBIS 18%
    const total = subtotalWithDiscount + tax;
    
    return {
      subtotal,
      discount: discountAmount,
      tax,
      total: Math.max(0, total)
    };
  };

  // Agregar artículo
  const addItem = (service: Service, serviceType: 'wash' | 'iron' | 'both', quantity: number = 1) => {
    let unitPrice: number;
    switch (serviceType) {
      case 'wash':
        unitPrice = parseFloat(service.washPrice);
        break;
      case 'iron':
        unitPrice = parseFloat(service.ironPrice);
        break;
      case 'both':
        unitPrice = parseFloat(service.bothPrice);
        break;
    }

    const newItem: InvoiceItemWithService = {
      id: `temp-${Date.now()}`,
      invoiceId: 'temp',
      serviceId: service.id,
      serviceName: service.name,
      serviceType,
      quantity,
      unitPrice: unitPrice.toString(),
      total: (unitPrice * quantity).toString(),
      service
    };

    const newItems = [...currentInvoice.items, newItem];
    const totals = calculateTotals(newItems);
    
    setCurrentInvoice({
      ...currentInvoice,
      items: newItems,
      ...totals
    });
  };

  // Eliminar artículo
  const removeItem = (itemId: string) => {
    const newItems = currentInvoice.items.filter(item => item.id !== itemId);
    const totals = calculateTotals(newItems);
    
    setCurrentInvoice({
      ...currentInvoice,
      items: newItems,
      ...totals
    });
  };

  // Actualizar cantidad de artículo
  const updateItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    const newItems = currentInvoice.items.map(item => {
      if (item.id === itemId) {
        const unitPrice = parseFloat(item.unitPrice);
        const newTotal = unitPrice * newQuantity;
        return {
          ...item,
          quantity: newQuantity,
          total: newTotal.toString()
        };
      }
      return item;
    });

    const totals = calculateTotals(newItems);
    
    setCurrentInvoice({
      ...currentInvoice,
      items: newItems,
      ...totals
    });
  };

  // Seleccionar cliente
  const selectCustomer = (customer: Customer) => {
    setCurrentInvoice({
      ...currentInvoice,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email || '',
    });
    
    invoiceForm.setValue('customerName', customer.name);
    invoiceForm.setValue('customerPhone', customer.phone);
    invoiceForm.setValue('customerEmail', customer.email || '');
    
    setShowCustomerSearchModal(false);
  };

  // Aplicar descuento
  const applyDiscount = () => {
    const totals = calculateTotals(currentInvoice.items, discountData.value);
    setCurrentInvoice({
      ...currentInvoice,
      ...totals
    });
    setShowDiscountModal(false);
  };

  // Resetear formulario
  const resetForm = () => {
    setCurrentInvoice({
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      deliveryDate: '',
      items: [],
      subtotal: 0,
      tax: 0,
      discount: 0,
      total: 0,
      paymentMethodId: '',
    });
    
    invoiceForm.reset();
    setDiscountData({ type: 'amount', value: 0, reason: '' });
  };

  // Crear factura
  const createInvoice = (paymentMethodCode: string, isPending = false) => {
    const formData = invoiceForm.getValues();
    
    if (!formData.customerName || !formData.customerPhone || currentInvoice.items.length === 0) {
      toast({
        title: "Campos incompletos",
        description: "Complete todos los campos requeridos y agregue al menos un artículo",
        variant: "destructive",
      });
      return;
    }

    // Preparar datos de factura (sin items)
    const invoiceData: InsertInvoice = {
      number: nextInvoiceNumber?.number || 'FAC-001',
      customerId: null,
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      customerEmail: formData.customerEmail || null,
      date: new Date(),
      deliveryDate: formData.deliveryDate ? new Date(formData.deliveryDate) : null,
      subtotal: currentInvoice.subtotal.toString(),
      tax: currentInvoice.tax.toString(),
      total: currentInvoice.total.toString(),
      paymentMethod: isPending ? 'pending' : paymentMethodCode,
      paymentReference: null,
      status: 'received',
      employeeId: localStorage.getItem('employeeId'),
      paid: !isPending,
      delivered: false,
      cancelledAt: null,
      cancellationReason: null,
    };

    // Preparar items de factura
    const items: InsertInvoiceItem[] = currentInvoice.items.map(item => ({
      invoiceId: 'temp', // Will be updated by server
      serviceId: item.serviceId,
      serviceName: item.serviceName,
      serviceType: item.serviceType,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total,
    }));

    // Enviar con la estructura que espera el backend
    const payload = {
      invoice: invoiceData,
      items: items
    };

    createInvoiceMutation.mutate(payload);
  };

  // Filtrar clientes para búsqueda
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    customer.phone.includes(customerSearchTerm)
  );

  if (customersLoading || servicesLoading || paymentMethodsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Nueva Factura</h1>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-gray-600 dark:text-gray-400">#{nextInvoiceNumber?.number || 'FAC-001'}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600 dark:text-gray-400">{formatDate(new Date().toISOString())}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información del Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <User className="w-6 h-6 mr-3 text-blue-600" />
                  Información del Cliente
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCustomerSearchModal(true)}
                  data-testid="button-search-customer"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Buscar Cliente
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Nombre Completo *</Label>
                  <Input
                    id="customerName"
                    data-testid="input-customer-name"
                    {...invoiceForm.register('customerName')}
                    onChange={(e) => {
                      invoiceForm.setValue('customerName', e.target.value);
                      setCurrentInvoice({...currentInvoice, customerName: e.target.value});
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone">Teléfono *</Label>
                  <Input
                    id="customerPhone"
                    data-testid="input-customer-phone"
                    {...invoiceForm.register('customerPhone')}
                    onChange={(e) => {
                      invoiceForm.setValue('customerPhone', e.target.value);
                      setCurrentInvoice({...currentInvoice, customerPhone: e.target.value});
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerEmail">Email (Opcional)</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    data-testid="input-customer-email"
                    {...invoiceForm.register('customerEmail')}
                    onChange={(e) => {
                      invoiceForm.setValue('customerEmail', e.target.value);
                      setCurrentInvoice({...currentInvoice, customerEmail: e.target.value});
                    }}
                  />
                </div>
                <div>
                  <Label>Fecha de Entrega</Label>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setShowDateModal(true)}
                    data-testid="button-select-delivery-date"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    {currentInvoice.deliveryDate ? formatDate(currentInvoice.deliveryDate) : 'Seleccionar fecha'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Servicios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="w-6 h-6 mr-3 text-green-600" />
                Servicios
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Selector rápido de servicios */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {services.slice(0, 3).map(service => (
                  <div key={service.id} className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">{service.name}</h4>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => addItem(service, 'wash')}
                        data-testid={`button-add-${service.name.toLowerCase()}-wash`}
                      >
                        Lavado - {formatCurrency(service.washPrice)}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => addItem(service, 'iron')}
                        data-testid={`button-add-${service.name.toLowerCase()}-iron`}
                      >
                        Planchado - {formatCurrency(service.ironPrice)}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => addItem(service, 'both')}
                        data-testid={`button-add-${service.name.toLowerCase()}-both`}
                      >
                        Ambos - {formatCurrency(service.bothPrice)}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Lista de artículos */}
              {currentInvoice.items.length > 0 && (
                <div className="border rounded-lg">
                  <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 rounded-t-lg border-b">
                    <h4 className="font-medium text-gray-900 dark:text-white">Artículos Agregados</h4>
                  </div>
                  <div className="divide-y">
                    {currentInvoice.items.map((item) => (
                      <div key={item.id} className="p-4 flex items-center justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 dark:text-white">{item.serviceName}</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.serviceType === 'wash' && 'Lavado'}
                            {item.serviceType === 'iron' && 'Planchado'}
                            {item.serviceType === 'both' && 'Lavado y Planchado'}
                            {' - '}{formatCurrency(item.unitPrice)} c/u
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                            data-testid={`button-decrease-quantity-${item.id}`}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center font-medium" data-testid={`text-quantity-${item.id}`}>
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                            data-testid={`button-increase-quantity-${item.id}`}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          <span className="w-20 text-right font-medium" data-testid={`text-total-${item.id}`}>
                            {formatCurrency(item.total)}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            data-testid={`button-remove-item-${item.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Panel de Resumen */}
        <div className="space-y-6">
          {/* Totales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-6 h-6 mr-3 text-green-600" />
                Resumen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                  <span data-testid="text-subtotal">{formatCurrency(currentInvoice.subtotal)}</span>
                </div>
                {currentInvoice.discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Descuento:</span>
                    <span data-testid="text-discount">-{formatCurrency(currentInvoice.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">ITBIS (18%):</span>
                  <span data-testid="text-tax">{formatCurrency(currentInvoice.tax)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span data-testid="text-total">{formatCurrency(currentInvoice.total)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowDiscountModal(true)}
                  data-testid="button-apply-discount"
                >
                  <Percent className="w-4 h-4 mr-2" />
                  Aplicar Descuento
                </Button>
                
                <Button
                  className="w-full"
                  onClick={() => setShowPaymentModal(true)}
                  disabled={currentInvoice.items.length === 0 || createInvoiceMutation.isPending}
                  data-testid="button-process-payment"
                >
                  {createInvoiceMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <CreditCard className="w-4 h-4 mr-2" />
                  )}
                  Procesar Pago
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Métodos de Pago */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-lg" data-testid="modal-payment-method">
          <DialogHeader>
            <DialogTitle className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
              Método de Pago
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center mb-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-lg text-gray-700 dark:text-gray-300">Total a cobrar:</p>
              <p className="text-3xl font-bold text-blue-600" data-testid="text-payment-total">
                {formatCurrency(currentInvoice.total)}
              </p>
            </div>
          </div>
          
          <div className="space-y-3 mb-6">
            {paymentMethods.filter(pm => pm.active).map((method) => (
              <Button
                key={method.id}
                variant="outline"
                className="w-full p-4 h-auto justify-start"
                onClick={() => createInvoice(method.code, false)}
                disabled={createInvoiceMutation.isPending}
                data-testid={`button-payment-${method.code}`}
              >
                <div className="flex items-center space-x-3">
                  {method.code === 'cash' && <Banknote className="w-6 h-6 text-green-600" />}
                  {method.code === 'card' && <CreditCard className="w-6 h-6 text-blue-600" />}
                  {method.code === 'transfer' && <Landmark className="w-6 h-6 text-indigo-600" />}
                  {method.code === 'mobile_pay' && <Phone className="w-6 h-6 text-purple-600" />}
                  <span className="font-medium">{method.name}</span>
                </div>
              </Button>
            ))}
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowPaymentModal(false)}
              data-testid="button-cancel-payment"
            >
              Cancelar
            </Button>
            <Button
              variant="outline"
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
              onClick={() => createInvoice('pending', true)}
              disabled={createInvoiceMutation.isPending}
              data-testid="button-pending-payment"
            >
              <Clock className="w-4 h-4 mr-2" />
              Pago Pendiente
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Búsqueda de Clientes */}
      <Dialog open={showCustomerSearchModal} onOpenChange={setShowCustomerSearchModal}>
        <DialogContent className="max-w-2xl max-h-96" data-testid="modal-customer-search">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Base de Clientes
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCustomerSearchModal(false)}
              >
                <X className="w-6 h-6" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                placeholder="Buscar cliente..."
                value={customerSearchTerm}
                onChange={(e) => setCustomerSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-customer-search"
              />
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              <div className="space-y-2">
                {filteredCustomers.map((customer) => (
                  <Button
                    key={customer.id}
                    variant="outline"
                    className="w-full p-4 h-auto justify-start text-left"
                    onClick={() => selectCustomer(customer)}
                    data-testid={`button-select-customer-${customer.id}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{customer.name}</h4>
                        <Badge variant="secondary">{customer.ordersCount || 0} órdenes</Badge>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Phone className="w-3 h-3 mr-2" />
                          {customer.phone}
                        </div>
                        {customer.email && (
                          <div className="flex items-center">
                            <Mail className="w-3 h-3 mr-2" />
                            {customer.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Descuento */}
      <Dialog open={showDiscountModal} onOpenChange={setShowDiscountModal}>
        <DialogContent className="max-w-md" data-testid="modal-discount">
          <DialogHeader>
            <DialogTitle className="text-center">
              <Percent className="w-12 h-12 text-green-600 mx-auto mb-4" />
              Aplicar Descuento
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="block mb-2">Tipo de Descuento</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={discountData.type === 'amount' ? 'default' : 'outline'}
                  onClick={() => setDiscountData({...discountData, type: 'amount'})}
                  data-testid="button-discount-amount"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Monto Fijo
                </Button>
                <Button
                  variant={discountData.type === 'percentage' ? 'default' : 'outline'}
                  onClick={() => setDiscountData({...discountData, type: 'percentage'})}
                  data-testid="button-discount-percentage"
                >
                  <Percent className="w-4 h-4 mr-2" />
                  Porcentaje
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="discountValue">
                Valor del Descuento {discountData.type === 'percentage' ? '(%)' : '(RD$)'}
              </Label>
              <Input
                id="discountValue"
                type="number"
                min="0"
                value={discountData.value}
                onChange={(e) => setDiscountData({...discountData, value: parseFloat(e.target.value) || 0})}
                data-testid="input-discount-value"
              />
            </div>
            
            <div>
              <Label htmlFor="discountReason">Motivo (Opcional)</Label>
              <Input
                id="discountReason"
                value={discountData.reason}
                onChange={(e) => setDiscountData({...discountData, reason: e.target.value})}
                placeholder="Cliente frecuente, promoción, etc."
                data-testid="input-discount-reason"
              />
            </div>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowDiscountModal(false)}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1"
              onClick={applyDiscount}
              disabled={discountData.value <= 0}
              data-testid="button-apply-discount-confirm"
            >
              Aplicar Descuento
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Fecha de Entrega */}
      <Dialog open={showDateModal} onOpenChange={setShowDateModal}>
        <DialogContent className="max-w-md" data-testid="modal-delivery-date">
          <DialogHeader>
            <DialogTitle className="text-center">
              <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              Fecha de Entrega
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="deliveryDate">Fecha de Entrega</Label>
              <Input
                id="deliveryDate"
                type="date"
                value={selectedDeliveryDate}
                onChange={(e) => setSelectedDeliveryDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                data-testid="input-delivery-date"
              />
            </div>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowDateModal(false)}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                setCurrentInvoice({...currentInvoice, deliveryDate: selectedDeliveryDate});
                invoiceForm.setValue('deliveryDate', selectedDeliveryDate);
                setShowDateModal(false);
              }}
              data-testid="button-confirm-delivery-date"
            >
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}