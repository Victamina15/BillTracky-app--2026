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
  CheckCircle,
  Users,
  CreditCard,
  Banknote,
  Landmark,
  Calculator,
  Percent,
  Minus,
  AlertCircle,
  Edit,
  Printer,
  MessageCircle,
  MoreVertical,
  Save
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
      'x-access-code': localStorage.getItem('employeeAccessCode') || '',
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
  const [showCustomerSearchModal, setShowCustomerSearchModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InvoiceItemWithService | null>(null);

  // Estados para el flujo de pago estilo Shopify POS
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [savedInvoiceId, setSavedInvoiceId] = useState<string | null>(null);
  const [isDraft, setIsDraft] = useState(false);

  // Estados para el nuevo selector de servicios escalable
  const [serviceSearchTerm, setServiceSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedServiceType, setSelectedServiceType] = useState<'wash' | 'iron' | 'both'>('wash');
  const [itemQuantity, setItemQuantity] = useState(1);
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
    mutationFn: async (payload: { invoice: InsertInvoice, items: InsertInvoiceItem[] }) => {
      console.log('[DEBUG] Starting invoice creation mutation...');
      const result = await authenticatedRequest('/api/invoices', 'POST', payload);
      console.log('[DEBUG] Invoice creation mutation completed successfully');
      return result;
    },
    onSuccess: (data) => {
      console.log('[DEBUG] Invoice creation onSuccess called');
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      
      // Guardar ID de la factura creada y marcar como borrador o pagada
      setSavedInvoiceId(data.invoice.id);
      setIsDraft(!data.invoice.paid);
      
      toast({
        title: data.invoice.paid ? "Factura pagada exitosamente" : "Pedido guardado exitosamente",
        description: `Factura ${data.invoice.number} por ${formatCurrency(data.invoice.total)} ha sido ${data.invoice.paid ? 'pagada' : 'guardada como borrador'}.`,
      });

      // Abrir modal de acciones post-guardado
      setShowActionsModal(true);
      console.log('[DEBUG] Invoice creation onSuccess completed');
    },
    onError: (error: any) => {
      console.error('[ERROR] Invoice creation failed:', error);
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
    // Evitar problemas de zona horaria al parsear fechas ISO
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('es-DO');
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

  // Actualizar artículo existente
  const updateItem = (itemId: string, service: Service, serviceType: 'wash' | 'iron' | 'both', quantity: number) => {
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

    const newItems = currentInvoice.items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          serviceId: service.id,
          serviceName: service.name,
          serviceType,
          quantity,
          unitPrice: unitPrice.toString(),
          total: (unitPrice * quantity).toString(),
          service
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
    
    // Resetear estados del flujo POS
    setSelectedPaymentMethod('');
    setSavedInvoiceId(null);
    setIsDraft(false);
    
    invoiceForm.reset();
    setDiscountData({ type: 'amount', value: 0, reason: '' });
  };

  // Guardar pedido como borrador (nuevo flujo estilo Shopify POS)
  const saveOrderDraft = () => {
    const formData = invoiceForm.getValues();
    
    if (!formData.customerName || !formData.customerPhone || currentInvoice.items.length === 0) {
      toast({
        title: "Campos incompletos",
        description: "Complete todos los campos requeridos y agregue al menos un artículo",
        variant: "destructive",
      });
      return;
    }

    // Preparar datos de factura como borrador
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
      paymentMethod: 'pending',
      paymentReference: null,
      status: 'received',
      employeeId: localStorage.getItem('employeeId'),
      paid: false, // Borrador no pagado
      delivered: false,
      cancelledAt: null,
      cancellationReason: null,
    };

    const items: InsertInvoiceItem[] = currentInvoice.items.map(item => ({
      invoiceId: 'temp',
      serviceId: item.serviceId,
      serviceName: item.serviceName,
      serviceType: item.serviceType,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total,
    }));

    const payload = { invoice: invoiceData, items: items };
    createInvoiceMutation.mutate(payload);
  };

  // Procesar pago (nuevo flujo estilo Shopify POS)
  const processPayment = () => {
    if (!selectedPaymentMethod) {
      toast({
        title: "Método de pago requerido",
        description: "Seleccione un método de pago antes de procesar",
        variant: "destructive",
      });
      return;
    }

    const formData = invoiceForm.getValues();
    
    if (!formData.customerName || !formData.customerPhone || currentInvoice.items.length === 0) {
      toast({
        title: "Campos incompletos",
        description: "Complete todos los campos requeridos y agregue al menos un artículo",
        variant: "destructive",
      });
      return;
    }

    // Preparar datos de factura pagada
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
      paymentMethod: selectedPaymentMethod,
      paymentReference: null,
      status: 'received',
      employeeId: localStorage.getItem('employeeId'),
      paid: true, // Factura pagada
      delivered: false,
      cancelledAt: null,
      cancellationReason: null,
    };

    const items: InsertInvoiceItem[] = currentInvoice.items.map(item => ({
      invoiceId: 'temp',
      serviceId: item.serviceId,
      serviceName: item.serviceName,
      serviceType: item.serviceType,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total,
    }));

    const payload = { invoice: invoiceData, items: items };
    createInvoiceMutation.mutate(payload);
  };

  // Crear factura (función original mantenida para compatibilidad)
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

  // Obtener categorías únicas de servicios (basado en nombres comunes)
  const getServiceCategories = () => {
    const categories = new Set<string>();
    services.forEach(service => {
      // Extraer categoría basada en el nombre del servicio
      const name = service.name.toLowerCase();
      if (name.includes('pantalon') || name.includes('jean') || name.includes('short')) {
        categories.add('Pantalones');
      } else if (name.includes('camisa') || name.includes('blusa') || name.includes('polo')) {
        categories.add('Camisas');
      } else if (name.includes('vestido') || name.includes('falda') || name.includes('saco')) {
        categories.add('Vestidos');
      } else if (name.includes('ropa interior') || name.includes('calcetines') || name.includes('medias')) {
        categories.add('Ropa Interior');
      } else if (name.includes('abrigo') || name.includes('chaqueta') || name.includes('sueter')) {
        categories.add('Abrigos');
      } else if (name.includes('cortina') || name.includes('sabana') || name.includes('funda')) {
        categories.add('Hogar');
      } else {
        categories.add('Otros');
      }
    });
    return Array.from(categories).sort();
  };

  // Filtrar servicios por categoría y búsqueda
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(serviceSearchTerm.toLowerCase());
    
    if (selectedCategory === 'all') return matchesSearch;
    
    const name = service.name.toLowerCase();
    const categoryMatch = {
      'Pantalones': name.includes('pantalon') || name.includes('jean') || name.includes('short'),
      'Camisas': name.includes('camisa') || name.includes('blusa') || name.includes('polo'),
      'Vestidos': name.includes('vestido') || name.includes('falda') || name.includes('saco'),
      'Ropa Interior': name.includes('ropa interior') || name.includes('calcetines') || name.includes('medias'),
      'Abrigos': name.includes('abrigo') || name.includes('chaqueta') || name.includes('sueter'),
      'Hogar': name.includes('cortina') || name.includes('sabana') || name.includes('funda'),
      'Otros': true // Otros incluye todo lo que no está en las categorías anteriores
    };
    
    return matchesSearch && categoryMatch[selectedCategory as keyof typeof categoryMatch];
  });

  // Resetear selección cuando cambia la búsqueda/categoría
  const resetItemSelection = () => {
    setSelectedService(null);
    setSelectedServiceType('wash');
    setItemQuantity(1);
  };

  // Agregar artículo desde la interfaz directa
  const addItemFromModal = () => {
    if (!selectedService) return;
    
    addItem(selectedService, selectedServiceType, itemQuantity);
    resetItemSelection();
  };

  // Actualizar artículo desde el modal de edición
  const updateItemFromModal = () => {
    if (!selectedService || !editingItem) return;
    
    updateItem(editingItem.id, selectedService, selectedServiceType, itemQuantity);
    resetItemSelection();
    setEditingItem(null);
    setShowEditItemModal(false);
  };

  if (customersLoading || servicesLoading || paymentMethodsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-2"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card dark:bg-gray-800/50 rounded-2xl dark:shadow-lg tech-glow border border-border dark:border-cyan-500/20 p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center dark:shadow-lg tech-glow">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-card-foreground dark:text-white tech-text-glow">Nueva Factura</h1>
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
          <Card className="tech-button-3d bg-white dark:bg-gray-800/50 border-2 border-cyan-300 dark:border-cyan-500/30 rounded-xl shadow-sm hover:bg-cyan-50 hover:border-cyan-400 dark:hover:bg-gray-700/50 transition-all duration-300 dark:backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mr-3 tech-glow">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-cyan-700 dark:text-cyan-300 tech-text-glow">Información del Cliente</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCustomerSearchModal(true)}
                  className="tech-button-3d bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-300 text-cyan-700 dark:bg-gradient-to-br dark:from-cyan-500/20 dark:to-blue-600/20 dark:text-cyan-300 dark:border-cyan-500/30 hover:from-cyan-100 hover:to-blue-100 hover:border-cyan-400 dark:hover:from-cyan-400/30 dark:hover:to-blue-500/30 transition-all duration-300 transform hover:scale-105 tech-glow"
                  data-testid="button-search-customer"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Buscar Cliente
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
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
              <div className="grid grid-cols-1 gap-4">
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
                    className="tech-button-3d w-full justify-start bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 text-purple-700 dark:bg-gradient-to-br dark:from-purple-500/20 dark:to-pink-600/20 dark:text-purple-300 dark:border-purple-500/30 hover:from-purple-100 hover:to-pink-100 hover:border-purple-400 dark:hover:from-purple-400/30 dark:hover:to-pink-500/30 transition-all duration-300 tech-glow"
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

          {/* Artículos del Pedido */}
          <Card className="bg-white dark:bg-gray-800/50 border-2 border-blue-300 dark:border-blue-500/30 rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                <span className="text-blue-700 dark:text-blue-300">Artículos del Pedido</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Interfaz directa para agregar artículos */}
              <div className="space-y-4">
                {/* Headers de columnas */}
                <div className="hidden md:grid grid-cols-6 gap-4 text-sm font-medium text-gray-600 dark:text-gray-400 pb-2 border-b dark:border-gray-700">
                  <div>Artículo</div>
                  <div>Cantidad</div>
                  <div className="col-span-2">Servicio</div>
                  <div>Total</div>
                  <div></div>
                </div>

                {/* Fila para agregar nuevo artículo */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center p-3 border-2 border-slate-300 dark:border-slate-500/30 rounded-lg bg-white dark:bg-gray-800/50">
                  {/* Dropdown de Artículo */}
                  <div>
                    <Select value={selectedService?.id || ""} onValueChange={(value) => {
                      const service = services.find(s => s.id === value);
                      setSelectedService(service || null);
                    }}>
                      <SelectTrigger data-testid="select-article">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent className="max-h-48">
                        {services.map(service => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Campo de Cantidad */}
                  <div>
                    <Input
                      type="number"
                      min="1"
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="text-center tech3d-input tech3d-text"
                      data-testid="input-direct-quantity"
                    />
                  </div>

                  {/* Dropdown de Servicio con precios */}
                  <div className="col-span-2">
                    <Select 
                      value={selectedServiceType} 
                      onValueChange={(value: 'wash' | 'iron' | 'both') => setSelectedServiceType(value)}
                      disabled={!selectedService}
                    >
                      <SelectTrigger className="tech3d-input tech3d-text" data-testid="select-service-type">
                        <SelectValue placeholder="Seleccionar servicio" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedService && (
                          <>
                            <SelectItem value="wash">
                              Lavado - {formatCurrency(selectedService.washPrice)}
                            </SelectItem>
                            <SelectItem value="iron">
                              Planchado - {formatCurrency(selectedService.ironPrice)}
                            </SelectItem>
                            <SelectItem value="both">
                              Lavado y Planchado - {formatCurrency(selectedService.bothPrice)}
                            </SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Total calculado */}
                  <div className="text-right font-bold text-green-600 dark:text-green-400 tech3d-text">
                    {selectedService && (
                      formatCurrency(
                        parseFloat(
                          selectedServiceType === 'wash' ? selectedService.washPrice :
                          selectedServiceType === 'iron' ? selectedService.ironPrice :
                          selectedService.bothPrice
                        ) * itemQuantity
                      )
                    )}
                  </div>

                  {/* Botón para agregar */}
                  <div>
                    <Button
                      onClick={addItemFromModal}
                      disabled={!selectedService}
                      size="sm"
                      variant="outline"
                      className="tech3d-button disabled:opacity-50"
                      data-testid="button-add-direct"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Lista de artículos agregados */}
              {currentInvoice.items.length > 0 && (
                <div className="space-y-2 mt-4">
                  {currentInvoice.items.map((item) => (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center p-3 tech3d-card">
                      {/* Artículo */}
                      <div className="font-medium tech3d-text">
                        {item.serviceName}
                      </div>

                      {/* Cantidad */}
                      <div className="text-center tech3d-text">
                        {item.quantity}
                      </div>

                      {/* Servicio con precio */}
                      <div className="col-span-2">
                        <span className="tech3d-text-muted">
                          {item.serviceType === 'wash' && 'Lavado'}
                          {item.serviceType === 'iron' && 'Planchado'}
                          {item.serviceType === 'both' && 'Lavado y Planchado'}
                          {' - '}{formatCurrency(item.unitPrice)}
                        </span>
                      </div>

                      {/* Total */}
                      <div className="text-right font-bold text-green-600 dark:text-green-400 tech3d-text">
                        {formatCurrency(item.total)}
                      </div>

                      {/* Botón de eliminar */}
                      <div className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          data-testid={`button-remove-item-${item.id}`}
                          className="tech3d-button-secondary border-red-300 text-red-600 dark:text-red-400 hover:border-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Panel de Resumen */}
        <div className="space-y-6">
          {/* Totales */}
          <Card className="tech-button-3d bg-white dark:bg-gray-800/50 border-2 border-purple-300 dark:border-purple-500/30 rounded-xl shadow-sm hover:bg-purple-50 hover:border-purple-400 dark:hover:bg-gray-700/50 transition-all duration-300 dark:backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3 tech-glow">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <span className="text-purple-700 dark:text-purple-300 tech-text-glow">Resumen</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                  <span data-testid="text-subtotal">{formatCurrency(currentInvoice.subtotal)}</span>
                </div>
                {currentInvoice.discount > 0 && (
                  <div className="flex justify-between text-red-600 dark:text-red-400">
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

              {/* Sección de Checkout estilo Shopify POS */}
              <div className="space-y-4 pt-4 border-t">
                {/* Botón aplicar descuento */}
                <Button
                  variant="outline"
                  className="tech-button-3d w-full bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-300 text-cyan-700 dark:bg-gradient-to-br dark:from-cyan-500/20 dark:to-blue-600/20 dark:text-cyan-300 dark:border-cyan-500/30 hover:from-cyan-100 hover:to-blue-100 hover:border-cyan-400 dark:hover:from-cyan-400/30 dark:hover:to-blue-500/30 transition-all duration-300 transform hover:scale-105 tech-glow"
                  onClick={() => setShowDiscountModal(true)}
                  data-testid="button-apply-discount"
                >
                  <Percent className="w-4 h-4 mr-2" />
                  Aplicar Descuento
                </Button>
                
                {/* Selector de método de pago */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Método de Pago
                  </label>
                  <select
                    value={selectedPaymentMethod}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="tech-button-3d w-full p-3 bg-gradient-to-br from-slate-50 to-gray-50 border-2 border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400 dark:bg-gradient-to-br dark:from-slate-800/40 dark:to-gray-800/40 dark:border-slate-500/30 dark:text-slate-200 text-slate-700 transition-all duration-300 hover:from-slate-100 hover:to-gray-100 tech-glow"
                    data-testid="select-payment-method"
                  >
                    <option value="">Seleccionar método de pago...</option>
                    {paymentMethods.filter(pm => pm.active).map((method) => (
                      <option key={method.id} value={method.code}>
                        {method.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Botones de acción estilo Shopify POS */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Botón Guardar Pedido - Estilo 3D */}
                  <Button
                    variant="outline"
                    className="tech-button-3d h-12 bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-300 text-cyan-700 dark:bg-gradient-to-br dark:from-cyan-500/20 dark:to-blue-600/20 dark:text-cyan-300 dark:border-cyan-500/30 hover:from-cyan-100 hover:to-blue-100 hover:border-cyan-400 dark:hover:from-cyan-400/30 dark:hover:to-blue-500/30 transition-all duration-300 transform hover:scale-105 tech-glow relative overflow-hidden"
                    onClick={saveOrderDraft}
                    disabled={currentInvoice.items.length === 0 || createInvoiceMutation.isPending || !!savedInvoiceId}
                    data-testid="button-save-order"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
                    {createInvoiceMutation.isPending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Guardar Pedido
                  </Button>

                  {/* Botón Procesar Pago */}
                  <Button
                    variant="outline"
                    className="tech-button-3d h-12 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 text-purple-700 dark:bg-gradient-to-br dark:from-purple-500/20 dark:to-pink-600/20 dark:text-purple-300 dark:border-purple-500/30 hover:from-purple-100 hover:to-pink-100 hover:border-purple-400 dark:hover:from-purple-400/30 dark:hover:to-pink-500/30 transition-all duration-300 transform hover:scale-105 tech-glow"
                    onClick={processPayment}
                    disabled={currentInvoice.items.length === 0 || !selectedPaymentMethod || createInvoiceMutation.isPending || !!savedInvoiceId}
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

                {/* Estado del pedido guardado */}
                {savedInvoiceId && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-800">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        {isDraft ? 'Pedido guardado como borrador' : 'Factura pagada exitosamente'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Botón de acciones */}
                <Button
                  variant="outline"
                  className="tech-button-3d w-full bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-300 text-cyan-700 dark:bg-gradient-to-br dark:from-cyan-500/20 dark:to-blue-600/20 dark:text-cyan-300 dark:border-cyan-500/30 hover:from-cyan-100 hover:to-blue-100 hover:border-cyan-400 dark:hover:from-cyan-400/30 dark:hover:to-blue-500/30 transition-all duration-300 transform hover:scale-105 tech-glow"
                  onClick={() => setShowActionsModal(true)}
                  disabled={!savedInvoiceId}
                  data-testid="button-invoice-actions"
                >
                  <span className="text-lg mr-2">🚀</span>
                  Acciones de Factura
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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
                    className="tech-button-3d w-full p-4 h-auto justify-start text-left bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 text-blue-700 dark:bg-gradient-to-br dark:from-blue-500/20 dark:to-cyan-600/20 dark:text-blue-300 dark:border-blue-500/30 hover:from-blue-100 hover:to-cyan-100 hover:border-blue-400 dark:hover:from-blue-400/30 dark:hover:to-cyan-500/30 transition-all duration-300 transform hover:scale-105 tech-glow"
                    onClick={() => selectCustomer(customer)}
                    data-testid={`button-select-customer-${customer.id}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{customer.name}</h4>
                        <Badge variant="secondary">{customer.ordersCount || 0} órdenes</Badge>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
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
              <Percent className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
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
              className="tech-button-3d flex-1 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 tech-glow"
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
              <Calendar className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
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

      {/* Modal de Agregar Artículo - Escalable para muchos servicios */}
      <Dialog open={showAddItemModal} onOpenChange={(open) => {
        setShowAddItemModal(open);
        if (!open) resetItemSelection();
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col" data-testid="modal-add-item">
          <DialogHeader>
            <DialogTitle className="text-center">
              <Plus className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              Agregar Artículo
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden space-y-4">
            {/* Búsqueda y Filtros */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="service-search">Buscar Servicio</Label>
                <Input
                  id="service-search"
                  type="text"
                  placeholder="Buscar por nombre de servicio..."
                  value={serviceSearchTerm}
                  onChange={(e) => setServiceSearchTerm(e.target.value)}
                  className="w-full"
                  data-testid="input-service-search"
                />
              </div>
              
              <div>
                <Label htmlFor="category-filter">Categoría</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger data-testid="select-category">
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {getServiceCategories().map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Lista de Servicios Filtrados */}
            <div className="flex-1 overflow-hidden">
              <Label>Servicios ({filteredServices.length})</Label>
              <div className="border rounded-lg h-48 overflow-y-auto mt-2">
                {filteredServices.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No se encontraron servicios
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {filteredServices.map(service => (
                      <div
                        key={service.id}
                        className={`p-3 rounded cursor-pointer transition-colors ${
                          selectedService?.id === service.id 
                            ? 'bg-blue-100 dark:bg-blue-900 border-blue-300' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => setSelectedService(service)}
                        data-testid={`service-option-${service.id}`}
                      >
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Lavado: {formatCurrency(service.washPrice)} | 
                          Planchado: {formatCurrency(service.ironPrice)} | 
                          Ambos: {formatCurrency(service.bothPrice)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Configuración del Artículo */}
            {selectedService && (
              <div className="space-y-3 border-t pt-4">
                <div>
                  <Label>Tipo de Servicio</Label>
                  <Select value={selectedServiceType} onValueChange={(value: 'wash' | 'iron' | 'both') => setSelectedServiceType(value)}>
                    <SelectTrigger data-testid="select-service-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wash">Lavado - {formatCurrency(selectedService.washPrice)}</SelectItem>
                      <SelectItem value="iron">Planchado - {formatCurrency(selectedService.ironPrice)}</SelectItem>
                      <SelectItem value="both">Lavado y Planchado - {formatCurrency(selectedService.bothPrice)}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Cantidad</Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="tech-button-3d bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-300 text-red-600 dark:bg-gradient-to-br dark:from-red-500/20 dark:to-pink-600/20 dark:text-red-300 dark:border-red-500/30 hover:from-red-100 hover:to-pink-100 hover:border-red-400 dark:hover:from-red-400/30 dark:hover:to-pink-500/30 transition-all duration-300 transform hover:scale-105 tech-glow"
                      onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                      data-testid="button-decrease-quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 text-center"
                      data-testid="input-quantity"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-blue-100 hover:bg-blue-200 border-blue-300 text-blue-700 shadow-md"
                      onClick={() => setItemQuantity(itemQuantity + 1)}
                      data-testid="button-increase-quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Vista Previa del Precio */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total del artículo:</span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(
                        parseFloat(
                          selectedServiceType === 'wash' ? selectedService.washPrice :
                          selectedServiceType === 'iron' ? selectedService.ironPrice :
                          selectedService.bothPrice
                        ) * itemQuantity
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowAddItemModal(false)}
              data-testid="button-cancel-add-item"
            >
              Cancelar
            </Button>
            <Button
              className="flex-1"
              onClick={addItemFromModal}
              disabled={!selectedService}
              data-testid="button-add-item-confirm"
            >
              Agregar Artículo
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Editar Artículo - Escalable para muchos servicios */}
      <Dialog open={showEditItemModal} onOpenChange={(open) => {
        setShowEditItemModal(open);
        if (!open) {
          resetItemSelection();
          setEditingItem(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col" data-testid="modal-edit-item">
          <DialogHeader>
            <DialogTitle className="text-center">
              <Edit className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
              Editar Artículo
            </DialogTitle>
            {editingItem && (
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Editando: {editingItem.serviceName}
              </p>
            )}
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden space-y-4">
            {/* Búsqueda y Filtros */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="edit-service-search">Buscar Servicio</Label>
                <Input
                  id="edit-service-search"
                  type="text"
                  placeholder="Buscar por nombre de servicio..."
                  value={serviceSearchTerm}
                  onChange={(e) => setServiceSearchTerm(e.target.value)}
                  className="w-full"
                  data-testid="input-edit-service-search"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-category-filter">Categoría</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger data-testid="select-edit-category">
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {getServiceCategories().map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Lista de Servicios Filtrados */}
            <div className="flex-1 overflow-hidden">
              <Label>Servicios ({filteredServices.length})</Label>
              <div className="border rounded-lg h-48 overflow-y-auto mt-2">
                {filteredServices.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No se encontraron servicios
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {filteredServices.map(service => (
                      <div
                        key={service.id}
                        className={`p-3 rounded cursor-pointer transition-colors ${
                          selectedService?.id === service.id 
                            ? 'bg-green-100 dark:bg-green-900 border-green-300' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => setSelectedService(service)}
                        data-testid={`edit-service-option-${service.id}`}
                      >
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Lavado: {formatCurrency(service.washPrice)} | 
                          Planchado: {formatCurrency(service.ironPrice)} | 
                          Ambos: {formatCurrency(service.bothPrice)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Configuración del Artículo */}
            {selectedService && (
              <div className="space-y-3 border-t pt-4">
                <div>
                  <Label>Tipo de Servicio</Label>
                  <Select value={selectedServiceType} onValueChange={(value: 'wash' | 'iron' | 'both') => setSelectedServiceType(value)}>
                    <SelectTrigger data-testid="select-edit-service-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wash">Lavado - {formatCurrency(selectedService.washPrice)}</SelectItem>
                      <SelectItem value="iron">Planchado - {formatCurrency(selectedService.ironPrice)}</SelectItem>
                      <SelectItem value="both">Lavado y Planchado - {formatCurrency(selectedService.bothPrice)}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Cantidad</Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="tech-button-3d bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-300 text-red-600 dark:bg-gradient-to-br dark:from-red-500/20 dark:to-pink-600/20 dark:text-red-300 dark:border-red-500/30 hover:from-red-100 hover:to-pink-100 hover:border-red-400 dark:hover:from-red-400/30 dark:hover:to-pink-500/30 transition-all duration-300 transform hover:scale-105 tech-glow"
                      onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                      data-testid="button-edit-decrease-quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 text-center"
                      data-testid="input-edit-quantity"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-blue-100 hover:bg-blue-200 border-blue-300 text-blue-700 shadow-md"
                      onClick={() => setItemQuantity(itemQuantity + 1)}
                      data-testid="button-edit-increase-quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Vista Previa del Precio */}
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total del artículo:</span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(
                        parseFloat(
                          selectedServiceType === 'wash' ? selectedService.washPrice :
                          selectedServiceType === 'iron' ? selectedService.ironPrice :
                          selectedService.bothPrice
                        ) * itemQuantity
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              className="tech-button-3d flex-1 bg-gradient-to-br from-gray-50 to-slate-50 border-2 border-gray-300 text-gray-700 dark:bg-gradient-to-br dark:from-gray-500/20 dark:to-slate-600/20 dark:text-gray-300 dark:border-gray-500/30 hover:from-gray-100 hover:to-slate-100 hover:border-gray-400 dark:hover:from-gray-400/30 dark:hover:to-slate-500/30 transition-all duration-300 transform hover:scale-105 tech-glow"
              onClick={() => setShowEditItemModal(false)}
              data-testid="button-cancel-edit-item"
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={updateItemFromModal}
              disabled={!selectedService}
              data-testid="button-update-item-confirm"
            >
              Actualizar Artículo
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Acciones Post-Guardado (Estilo Shopify POS) */}
      <Dialog open={showActionsModal} onOpenChange={setShowActionsModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              {isDraft ? 'Pedido Guardado Exitosamente' : 'Factura Procesada Exitosamente'}
            </DialogTitle>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isDraft 
                  ? 'El pedido ha sido guardado como borrador. Puede procesar el pago más tarde.' 
                  : 'La factura ha sido pagada y procesada correctamente.'}
              </p>
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-800">
                <p className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                  Total: {formatCurrency(currentInvoice.total)}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  Cliente: {currentInvoice.customerName}
                </p>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-3">
            {/* Botón Imprimir */}
            <Button
              variant="outline"
              className="tech-button-3d w-full p-4 h-auto justify-start bg-gradient-to-br from-gray-50 to-slate-50 border-2 border-gray-300 text-gray-700 dark:bg-gradient-to-br dark:from-gray-500/20 dark:to-slate-600/20 dark:text-gray-300 dark:border-gray-500/30 hover:from-gray-100 hover:to-slate-100 hover:border-gray-400 dark:hover:from-gray-400/30 dark:hover:to-slate-500/30 transition-all duration-300 transform hover:scale-105 tech-glow"
              onClick={() => {
                window.print();
                setShowActionsModal(false);
              }}
              data-testid="button-print-invoice"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Printer className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-800 dark:text-gray-200">Imprimir Recibo</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Generar versión impresa para el cliente</div>
                </div>
              </div>
            </Button>

            {/* Botón WhatsApp */}
            <Button
              variant="outline"
              className="tech-button-3d w-full p-4 h-auto justify-start bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 text-green-700 dark:bg-gradient-to-br dark:from-green-500/20 dark:to-emerald-600/20 dark:text-green-300 dark:border-green-500/30 hover:from-green-100 hover:to-emerald-100 hover:border-green-400 dark:hover:from-green-400/30 dark:hover:to-emerald-500/30 transition-all duration-300 transform hover:scale-105 tech-glow"
              onClick={() => {
                const phoneNumber = currentInvoice.customerPhone.replace(/[^\d]/g, '');
                const message = isDraft 
                  ? `¡Hola ${currentInvoice.customerName}! Hemos recibido tu pedido de lavandería. Total: ${formatCurrency(currentInvoice.total)}. Te notificaremos cuando esté listo para recoger.`
                  : `¡Hola ${currentInvoice.customerName}! Tu pedido de lavandería está listo para recoger. Total: ${formatCurrency(currentInvoice.total)}. ${currentInvoice.deliveryDate ? `Fecha de entrega: ${formatDate(currentInvoice.deliveryDate)}` : 'Puedes pasar a recogerlo cuando gustes.'}`;
                const whatsappUrl = `https://wa.me/1${phoneNumber}?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
                setShowActionsModal(false);
              }}
              disabled={!currentInvoice.customerPhone}
              data-testid="button-whatsapp-invoice"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MessageCircle className="w-5 h-5 text-green-700 dark:text-green-400" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-green-800 dark:text-green-300">Enviar por WhatsApp</div>
                  <div className="text-sm text-green-600 dark:text-green-400">
                    {currentInvoice.customerPhone ? 'Notificar al cliente directamente' : 'Teléfono no disponible'}
                  </div>
                </div>
              </div>
            </Button>

            {/* Botón Email */}
            <Button
              variant="outline"
              className="tech-button-3d w-full p-4 h-auto justify-start bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 text-blue-700 dark:bg-gradient-to-br dark:from-blue-500/20 dark:to-indigo-600/20 dark:text-blue-300 dark:border-blue-500/30 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-400 dark:hover:from-blue-400/30 dark:hover:to-indigo-500/30 transition-all duration-300 transform hover:scale-105 tech-glow"
              onClick={() => {
                const subject = `${isDraft ? 'Pedido Recibido' : 'Factura de Lavandería'} - Billtracky`;
                const body = isDraft
                  ? `Estimado/a ${currentInvoice.customerName},%0D%0A%0D%0AHemos recibido su pedido de lavandería.%0D%0A%0D%0ATotal: ${formatCurrency(currentInvoice.total)}%0D%0A%0D%0ALe notificaremos cuando esté listo para recoger.%0D%0A%0D%0AGracias por confiar en Billtracky.`
                  : `Estimado/a ${currentInvoice.customerName},%0D%0A%0D%0ASu pedido está listo para recoger.%0D%0A%0D%0ATotal: ${formatCurrency(currentInvoice.total)}%0D%0A${currentInvoice.deliveryDate ? `Fecha de entrega: ${formatDate(currentInvoice.deliveryDate)}%0D%0A` : ''}%0D%0AGracias por confiar en Billtracky.`;
                const mailtoUrl = `mailto:${currentInvoice.customerEmail}?subject=${subject}&body=${body}`;
                window.location.href = mailtoUrl;
                setShowActionsModal(false);
              }}
              disabled={!currentInvoice.customerEmail}
              data-testid="button-email-invoice"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-700" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-blue-800">Enviar por Correo</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">
                    {currentInvoice.customerEmail ? 'Notificar por email' : 'Email no disponible'}
                  </div>
                </div>
              </div>
            </Button>
          </div>

          <div className="flex space-x-3 pt-4 border-t">
            {/* Botón Nuevo Pedido */}
            <Button
              className="tech-button-3d flex-1 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white border-0 shadow-lg hover:shadow-xl dark:shadow-lg dark:hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 tech-glow"
              onClick={() => {
                resetForm();
                setShowActionsModal(false);
              }}
              data-testid="button-new-order"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Pedido
            </Button>
            
            {/* Botón Cerrar */}
            <Button
              variant="outline"
              className="tech-button-3d flex-1 bg-gradient-to-br from-gray-50 to-slate-50 border-2 border-gray-300 text-gray-700 dark:bg-gradient-to-br dark:from-gray-500/20 dark:to-slate-600/20 dark:text-gray-300 dark:border-gray-500/30 hover:from-gray-100 hover:to-slate-100 hover:border-gray-400 dark:hover:from-gray-400/30 dark:hover:to-slate-500/30 transition-all duration-300 transform hover:scale-105 tech-glow"
              onClick={() => setShowActionsModal(false)}
              data-testid="button-close-actions"
            >
              Finalizar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}