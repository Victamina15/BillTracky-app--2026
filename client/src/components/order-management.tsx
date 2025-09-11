import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  DollarSign, 
  Printer, 
  X, 
  Check, 
  Clock, 
  Package, 
  AlertCircle,
  Phone,
  Calendar,
  User,
  CreditCard,
  Banknote,
  Landmark,
  RefreshCw,
  CheckCircle,
  XCircle,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { apiRequest } from '@/lib/queryClient';
import type { Invoice, InvoiceItem, PaymentMethod } from '@shared/schema';

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
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  
  return res.json();
}

interface OrderWithItems extends Invoice {
  items?: InvoiceItem[];
}

interface OrderManagementProps {
  onNotification: (message: string) => void;
}

export default function OrderManagement({ onNotification }: OrderManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showWorkTicketModal, setShowWorkTicketModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');

  const queryClient = useQueryClient();

  // Obtener órdenes
  const { 
    data: orders = [], 
    isLoading: ordersLoading, 
    error: ordersError, 
    refetch: refetchOrders 
  } = useQuery<Invoice[]>({
    queryKey: ['/api/invoices'],
    retry: 2,
    retryDelay: 1000,
  });

  // Obtener métodos de pago
  const { 
    data: paymentMethods = [], 
    isLoading: paymentMethodsLoading, 
    error: paymentMethodsError, 
    refetch: refetchPaymentMethods 
  } = useQuery<PaymentMethod[]>({
    queryKey: ['/api/payment-methods'],
    retry: 2,
    retryDelay: 1000,
  });

  // Obtener items de la orden seleccionada
  const { 
    data: orderItems = [], 
    isLoading: orderItemsLoading, 
    error: orderItemsError, 
    refetch: refetchOrderItems 
  } = useQuery<InvoiceItem[]>({
    queryKey: ['/api/invoices', selectedOrder?.id, 'items'],
    enabled: !!selectedOrder?.id,
    retry: 2,
    retryDelay: 1000,
  });

  // Mutaciones
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      authenticatedRequest(`/api/invoices/${id}/status`, 'PATCH', { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      setShowStatusModal(false);
      onNotification("Estado actualizado: El estado de la orden se ha actualizado exitosamente.");
    },
    onError: (error: any) => {
      onNotification("Error: " + (error.message || "No se pudo actualizar el estado"));
    },
  });

  const paymentMutation = useMutation({
    mutationFn: ({ id, paymentMethod, paymentReference }: { id: string; paymentMethod: string; paymentReference?: string }) =>
      authenticatedRequest(`/api/invoices/${id}/pay`, 'PATCH', { paymentMethod, paymentReference }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      setShowPaymentModal(false);
      setPaymentReference('');
      setSelectedPaymentMethod('');
      onNotification("Pago procesado: El pago se ha procesado exitosamente.");
    },
    onError: (error: any) => {
      onNotification("Error: " + (error.message || "No se pudo procesar el pago"));
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      authenticatedRequest(`/api/invoices/${id}/cancel`, 'PATCH', { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      setShowCancelModal(false);
      setCancelReason('');
      onNotification("Orden cancelada: La orden se ha cancelado exitosamente.");
    },
    onError: (error: any) => {
      onNotification("Error: " + (error.message || "No se pudo cancelar la orden"));
    },
  });

  // Error handling effects
  useEffect(() => {
    if (ordersError) {
      onNotification("Error al cargar órdenes: " + (ordersError instanceof Error ? ordersError.message : "No se pudieron cargar las órdenes"));
    }
  }, [ordersError, onNotification]);

  useEffect(() => {
    if (paymentMethodsError) {
      onNotification("Error al cargar métodos de pago: " + (paymentMethodsError instanceof Error ? paymentMethodsError.message : "No se pudieron cargar los métodos de pago"));
    }
  }, [paymentMethodsError, onNotification]);

  useEffect(() => {
    if (orderItemsError) {
      onNotification("Error al cargar items de la orden: " + (orderItemsError instanceof Error ? orderItemsError.message : "No se pudieron cargar los items de la orden"));
    }
  }, [orderItemsError, onNotification]);

  // Configuración de estados
  const statusConfig = {
    received: { name: 'Recibido', colorClass: 'bg-blue-50 text-blue-700', icon: Package },
    in_process: { name: 'En Proceso', colorClass: 'bg-yellow-50 text-yellow-700', icon: RefreshCw },
    ready: { name: 'Listo', colorClass: 'bg-purple-50 text-purple-700', icon: CheckCircle },
    delivered: { name: 'Entregado', colorClass: 'bg-green-50 text-green-700', icon: Check },
    cancelled: { name: 'Cancelado', colorClass: 'bg-red-50 text-red-700', icon: XCircle },
  };

  // Helper function para obtener clases de estado de forma segura
  const getStatusClasses = (status: string | null) => {
    if (!status) return 'bg-gray-50 text-gray-700';
    
    switch(status) {
      case 'received': return 'bg-blue-50 text-blue-700';
      case 'in_process': return 'bg-yellow-50 text-yellow-700'; 
      case 'ready': return 'bg-purple-50 text-purple-700';
      case 'delivered': return 'bg-green-50 text-green-700';
      case 'cancelled': return 'bg-red-50 text-red-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  // Helper function para obtener clases de pago de forma segura
  const getPaymentClasses = (paid: boolean | null) => {
    return paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  const paymentMethodConfig = {
    cash: { name: 'Efectivo', icon: Banknote, color: 'text-green-600' },
    card: { name: 'Tarjeta', icon: CreditCard, color: 'text-blue-600' },
    transfer: { name: 'Transferencia', icon: Landmark, color: 'text-indigo-600' },
    mobile_pay: { name: 'Pago Móvil', icon: Phone, color: 'text-purple-600' },
    pending: { name: 'Pendiente', icon: Clock, color: 'text-yellow-600' },
  };

  // Funciones utilitarias
  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `RD$${num.toFixed(2)}`;
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filtrar órdenes
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone?.includes(searchTerm) || false;
    
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesPayment = filterPayment === 'all' || 
                          (filterPayment === 'paid' && order.paid) ||
                          (filterPayment === 'pending' && !order.paid);
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Funciones de acción
  const openWorkTicketModal = (order: OrderWithItems) => {
    setSelectedOrder(order);
    setShowWorkTicketModal(true);
  };

  const handleStatusChange = (newStatus: string) => {
    if (!selectedOrder) return;
    statusMutation.mutate({ id: selectedOrder.id, status: newStatus });
  };

  const handlePayment = () => {
    if (!selectedOrder || !selectedPaymentMethod) return;
    
    const method = paymentMethods.find(pm => pm.id === selectedPaymentMethod);
    if (!method) {
      onNotification("Error: Método de pago no encontrado");
      return;
    }

    paymentMutation.mutate({
      id: selectedOrder.id,
      paymentMethod: method.code,
      paymentReference: method.requiresReference ? paymentReference : undefined
    });
  };

  const handleCancel = () => {
    if (!selectedOrder || !cancelReason.trim()) return;
    cancelMutation.mutate({ id: selectedOrder.id, reason: cancelReason });
  };

  const openDetailsModal = (order: Invoice) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const isLoading = ordersLoading || paymentMethodsLoading;
  const hasError = ordersError || paymentMethodsError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando órdenes...</span>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Error al cargar datos</h3>
          <p className="text-gray-600">No se pudieron cargar las órdenes o métodos de pago</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={() => refetchOrders()} 
            variant="outline"
            data-testid="button-retry-orders"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar Órdenes
          </Button>
          <Button 
            onClick={() => refetchPaymentMethods()} 
            variant="outline"
            data-testid="button-retry-payment-methods"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar Métodos de Pago
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Órdenes</h1>
          <p className="text-gray-600">Administra el estado y pago de las órdenes</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            {filteredOrders.length} órdenes
          </Badge>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por número, cliente o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-orders"
              />
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus} data-testid="select-status-filter">
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="received">Recibido</SelectItem>
                <SelectItem value="in_process">En Proceso</SelectItem>
                <SelectItem value="ready">Listo</SelectItem>
                <SelectItem value="delivered">Entregado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPayment} onValueChange={setFilterPayment} data-testid="select-payment-filter">
              <SelectTrigger>
                <SelectValue placeholder="Pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los pagos</SelectItem>
                <SelectItem value="paid">Pagado</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
                setFilterPayment('all');
              }}
              data-testid="button-clear-filters"
            >
              <X className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de órdenes */}
      <div className="grid gap-4">
        {filteredOrders.map((order) => {
          const status = statusConfig[order.status as keyof typeof statusConfig];
          const StatusIcon = status?.icon || Package;
          const paymentMethod = paymentMethodConfig[order.paymentMethod as keyof typeof paymentMethodConfig];
          
          return (
            <Card key={order.id} className="hover:shadow-md transition-shadow" data-testid={`card-order-${order.id}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                    <div>
                      <div className="font-semibold text-blue-600" data-testid={`text-order-number-${order.id}`}>
                        {order.number}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(order.date)}
                      </div>
                    </div>
                    
                    <div>
                      <div className="font-medium" data-testid={`text-customer-name-${order.id}`}>
                        {order.customerName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.customerPhone}
                      </div>
                    </div>
                    
                    <div>
                      <Badge className={getStatusClasses(order.status)} data-testid={`badge-status-${order.id}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status?.name || order.status}
                      </Badge>
                    </div>
                    
                    <div>
                      <div className="font-semibold" data-testid={`text-total-${order.id}`}>
                        {formatCurrency(order.total)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Fecha entrega: {formatDate(order.deliveryDate)}
                      </div>
                    </div>
                    
                    <div>
                      <Badge 
                        className={getPaymentClasses(order.paid)}
                        data-testid={`badge-payment-${order.id}`}
                      >
                        {order.paid ? "Pagado" : "Pendiente"}
                      </Badge>
                      {paymentMethod && (
                        <div className="text-sm text-gray-500 mt-1">
                          {paymentMethod.name}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        onClick={() => openDetailsModal(order)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
                        data-testid={`button-details-${order.id}`}
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        onClick={() => openWorkTicketModal(order)}
                        className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200"
                        data-testid={`button-ticket-${order.id}`}
                        title="Ticket de trabajo"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      
                      {order.status !== 'cancelled' && order.status !== 'delivered' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowStatusModal(true);
                            }}
                            className="bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200"
                            data-testid={`button-status-${order.id}`}
                            title="Cambiar estado"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          
                          {!order.paid && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowPaymentModal(true);
                              }}
                              className="bg-green-50 hover:bg-green-100 text-green-700 border border-green-200"
                              data-testid={`button-payment-${order.id}`}
                              title="Marcar como pagado"
                            >
                              <DollarSign className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowCancelModal(true);
                            }}
                            className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                            data-testid={`button-cancel-${order.id}`}
                            title="Cancelar orden"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay órdenes</h3>
            <p className="text-gray-500">No se encontraron órdenes que coincidan con los filtros aplicados.</p>
          </CardContent>
        </Card>
      )}

      {/* Modal de detalles */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de la Orden {selectedOrder?.number}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Información del cliente */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Información del Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Nombre</Label>
                      <div className="mt-1" data-testid="text-detail-customer-name">
                        {selectedOrder.customerName}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Teléfono</Label>
                      <div className="mt-1" data-testid="text-detail-customer-phone">
                        {selectedOrder.customerPhone}
                      </div>
                    </div>
                    {selectedOrder.customerEmail && (
                      <div>
                        <Label className="text-sm font-medium">Email</Label>
                        <div className="mt-1" data-testid="text-detail-customer-email">
                          {selectedOrder.customerEmail}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Información de la orden */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Información de la Orden
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Estado</Label>
                      <div className="mt-1">
                        <Badge className={getStatusClasses(selectedOrder.status)}>
                          {statusConfig[selectedOrder.status as keyof typeof statusConfig]?.name || selectedOrder.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Fecha de recibo</Label>
                      <div className="mt-1" data-testid="text-detail-date">
                        {formatDate(selectedOrder.date)}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Fecha de entrega</Label>
                      <div className="mt-1" data-testid="text-detail-delivery-date">
                        {formatDate(selectedOrder.deliveryDate)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Items de la orden */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Artículos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {orderItemsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                      <span>Cargando artículos...</span>
                    </div>
                  ) : orderItemsError ? (
                    <div className="text-center py-8 space-y-4">
                      <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
                      <div>
                        <p className="text-red-600 font-medium">Error al cargar artículos</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {orderItemsError instanceof Error ? orderItemsError.message : "No se pudieron cargar los artículos"}
                        </p>
                      </div>
                      <Button 
                        onClick={() => refetchOrderItems()} 
                        variant="outline" 
                        size="sm"
                        data-testid="button-retry-order-items"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reintentar
                      </Button>
                    </div>
                  ) : orderItems.length > 0 ? (
                    <div className="space-y-2">
                      {orderItems.map((item, index) => (
                        <div key={item.id} className="flex justify-between items-center p-2 border rounded" data-testid={`item-${index}`}>
                          <div>
                            <div className="font-medium">{item.serviceName}</div>
                            <div className="text-sm text-gray-500">Cantidad: {item.quantity}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium" data-testid={`item-total-${index}`}>
                              {formatCurrency(item.total)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatCurrency(item.unitPrice)} c/u
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      No hay artículos para mostrar
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Resumen financiero */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Resumen Financiero
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span data-testid="text-detail-subtotal">{formatCurrency(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ITBIS (18%):</span>
                      <span data-testid="text-detail-tax">{formatCurrency(selectedOrder.tax)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span data-testid="text-detail-total">{formatCurrency(selectedOrder.total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estado del pago:</span>
                      <Badge variant={selectedOrder.paid ? "default" : "secondary"}>
                        {selectedOrder.paid ? "Pagado" : "Pendiente"}
                      </Badge>
                    </div>
                    {selectedOrder.paymentMethod && selectedOrder.paymentMethod !== 'pending' && (
                      <div className="flex justify-between">
                        <span>Método de pago:</span>
                        <span>{paymentMethodConfig[selectedOrder.paymentMethod as keyof typeof paymentMethodConfig]?.name}</span>
                      </div>
                    )}
                    {selectedOrder.paymentReference && (
                      <div className="flex justify-between">
                        <span>Referencia:</span>
                        <span>{selectedOrder.paymentReference}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Información de cancelación si aplica */}
              {selectedOrder.status === 'cancelled' && (
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <XCircle className="h-5 w-5" />
                      Información de Cancelación
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <Label className="text-sm font-medium">Fecha de cancelación</Label>
                        <div className="mt-1">{formatDate(selectedOrder.cancelledAt)}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Motivo de cancelación</Label>
                        <div className="mt-1">{selectedOrder.cancellationReason}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de cambio de estado */}
      <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Estado de la Orden</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>¿Qué estado deseas asignar a la orden <strong>{selectedOrder?.number}</strong>?</p>
            <div className="grid grid-cols-2 gap-2">
              {['received', 'in_process', 'ready', 'delivered'].map((status) => {
                const config = statusConfig[status as keyof typeof statusConfig];
                const Icon = config.icon;
                return (
                  <Button
                    key={status}
                    variant="outline"
                    className="h-auto p-4"
                    onClick={() => handleStatusChange(status)}
                    disabled={statusMutation.isPending}
                    data-testid={`button-set-status-${status}`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Icon className="h-6 w-6" />
                      <span>{config.name}</span>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de pago */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Procesar Pago</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Procesar pago para la orden <strong>{selectedOrder?.number}</strong></p>
            <div>
              <Label htmlFor="payment-method">Método de pago</Label>
              <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod} data-testid="select-payment-method">
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona método de pago" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.filter((pm: PaymentMethod) => pm.active).map((method: PaymentMethod) => (
                    <SelectItem key={method.id} value={method.id}>
                      {method.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {(() => {
              const method = paymentMethods.find((pm: PaymentMethod) => pm.id === selectedPaymentMethod);
              return method?.requiresReference && (
                <div>
                  <Label htmlFor="payment-reference">Referencia de pago</Label>
                  <Input
                    id="payment-reference"
                    placeholder="Número de referencia"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    data-testid="input-payment-reference"
                  />
                </div>
              );
            })()}
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPaymentModal(false)} data-testid="button-cancel-payment">
                Cancelar
              </Button>
              <Button 
                onClick={handlePayment} 
                disabled={!selectedPaymentMethod || paymentMutation.isPending}
                data-testid="button-process-payment"
              >
                {paymentMutation.isPending ? "Procesando..." : "Procesar Pago"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de cancelación */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Orden</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>¿Estás seguro de que deseas cancelar la orden <strong>{selectedOrder?.number}</strong>?</p>
            <div>
              <Label htmlFor="cancel-reason">Motivo de cancelación *</Label>
              <Textarea
                id="cancel-reason"
                placeholder="Explica el motivo de la cancelación..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                data-testid="textarea-cancel-reason"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCancelModal(false)} data-testid="button-cancel-cancel">
                Cancelar
              </Button>
              <Button 
                variant="destructive"
                onClick={handleCancel}
                disabled={!cancelReason.trim() || cancelMutation.isPending}
                data-testid="button-confirm-cancel"
              >
                {cancelMutation.isPending ? "Cancelando..." : "Confirmar Cancelación"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de ticket de trabajo */}
      <Dialog open={showWorkTicketModal} onOpenChange={setShowWorkTicketModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" data-testid="modal-work-ticket">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Ticket de Trabajo - Orden {selectedOrder?.number}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Información del cliente */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4" />
                    Cliente: {selectedOrder.customerName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Teléfono:</span> {selectedOrder.customerPhone}
                    </div>
                    <div>
                      <span className="font-medium">Fecha de entrega:</span> {formatDate(selectedOrder.deliveryDate)}
                    </div>
                    <div>
                      <span className="font-medium">Estado:</span> 
                      <Badge className={`${getStatusClasses(selectedOrder.status)} ml-2`}>
                        {statusConfig[selectedOrder.status as keyof typeof statusConfig]?.name || selectedOrder.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Desglose de prendas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-purple-600" />
                    Desglose de Prendas a Procesar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orderItemsLoading ? (
                      <p className="text-center text-gray-500" data-testid="text-loading-items">Cargando items...</p>
                    ) : orderItems.length > 0 ? (
                      orderItems.map((item, index) => (
                        <div key={item.id || index} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800" data-testid={`work-ticket-item-${index}`}>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                            <div>
                              <h4 className="font-semibold text-purple-700 dark:text-purple-300" data-testid={`item-service-name-${index}`}>
                                {item.serviceName}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400" data-testid={`item-quantity-${index}`}>
                                Cantidad: {item.quantity}
                              </p>
                            </div>
                            
                            <div className="space-y-2">
                              <h5 className="font-medium text-sm">Servicios a realizar:</h5>
                              <div className="space-y-1" data-testid={`service-indicators-${index}`}>
                                {item.serviceType === 'wash' && (
                                  <div className="flex items-center gap-2" data-testid={`wash-indicator-${index}`}>
                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                    <span className="text-sm">Lavado</span>
                                  </div>
                                )}
                                {item.serviceType === 'iron' && (
                                  <div className="flex items-center gap-2" data-testid={`iron-indicator-${index}`}>
                                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                    <span className="text-sm">Planchado</span>
                                  </div>
                                )}
                                {item.serviceType === 'both' && (
                                  <>
                                    <div className="flex items-center gap-2" data-testid={`wash-indicator-${index}`}>
                                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                      <span className="text-sm">Lavado</span>
                                    </div>
                                    <div className="flex items-center gap-2" data-testid={`iron-indicator-${index}`}>
                                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                      <span className="text-sm">Planchado</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Precio unitario:</p>
                              <p className="font-semibold" data-testid={`item-unit-price-${index}`}>{formatCurrency(item.unitPrice)}</p>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Total:</p>
                              <p className="font-bold text-green-600" data-testid={`item-total-${index}`}>{formatCurrency(item.total)}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500" data-testid="text-no-items">No hay items en esta orden</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Resumen del ticket */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Resumen de Trabajo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg" data-testid="wash-counter">
                      <div className="font-bold text-lg text-blue-600" data-testid="wash-count">
                        {orderItems.filter(item => item.serviceType === 'wash' || item.serviceType === 'both').reduce((acc, item) => acc + item.quantity, 0)}
                      </div>
                      <div className="text-blue-600">Prendas para lavar</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg" data-testid="iron-counter">
                      <div className="font-bold text-lg text-orange-600" data-testid="iron-count">
                        {orderItems.filter(item => item.serviceType === 'iron' || item.serviceType === 'both').reduce((acc, item) => acc + item.quantity, 0)}
                      </div>
                      <div className="text-orange-600">Prendas para planchar</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg" data-testid="total-counter">
                      <div className="font-bold text-lg text-green-600" data-testid="order-total">
                        {formatCurrency(selectedOrder.total)}
                      </div>
                      <div className="text-green-600">Total de la orden</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}