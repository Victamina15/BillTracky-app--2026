import { useState, useEffect } from "react";
import { Plus, Save, Printer, Trash2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Employee, type Service, type Customer } from "@shared/schema";

interface InvoiceFormProps {
  user: Employee;
  onNotification: (message: string) => void;
}

interface InvoiceItem {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceType: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export default function InvoiceForm({ user, onNotification }: InvoiceFormProps) {
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [selectedService, setSelectedService] = useState("");
  const [selectedServiceType, setSelectedServiceType] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("pending");

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const { data: nextNumber } = useQuery({
    queryKey: ["/api/invoices/next-number"],
  });

  const { data: existingCustomer } = useQuery({
    queryKey: ["/api/customers/phone", customerPhone],
    enabled: customerPhone.length >= 10,
  });

  const saveInvoiceMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/invoices", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/metrics/dashboard"] });
      onNotification("Factura guardada exitosamente");
      clearForm();
    },
    onError: () => {
      onNotification("Error al guardar la factura");
    },
  });

  useEffect(() => {
    if (nextNumber) {
      setInvoiceNumber(nextNumber.number);
    }
  }, [nextNumber]);

  useEffect(() => {
    if (existingCustomer && existingCustomer.name) {
      setCustomerName(existingCustomer.name);
    }
  }, [existingCustomer]);

  const addItem = () => {
    if (!selectedService || !selectedServiceType) {
      onNotification("Seleccione un servicio y tipo");
      return;
    }

    const service = services.find(s => s.id === selectedService);
    if (!service) return;

    let unitPrice = 0;
    switch (selectedServiceType) {
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

    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      serviceId: service.id,
      serviceName: service.name,
      serviceType: selectedServiceType,
      quantity,
      unitPrice,
      total: unitPrice * quantity
    };

    setItems([...items, newItem]);
    setQuantity(1);
    setSelectedService("");
    setSelectedServiceType("");
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const getServiceTypeName = (type: string) => {
    switch (type) {
      case 'wash': return 'Solo Lavado';
      case 'iron': return 'Solo Planchado';
      case 'both': return 'Lavado + Planchado';
      default: return type;
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  const handleSave = () => {
    if (!customerName || !customerPhone || items.length === 0) {
      onNotification("Complete todos los campos requeridos");
      return;
    }

    const invoiceData = {
      number: invoiceNumber,
      customerId: existingCustomer?.id || null,
      customerName,
      customerPhone,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      paymentMethod,
      status: "received",
      employeeId: user.id
    };

    const invoiceItems = items.map(item => ({
      serviceId: item.serviceId,
      serviceName: item.serviceName,
      serviceType: item.serviceType,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toFixed(2),
      total: item.total.toFixed(2)
    }));

    saveInvoiceMutation.mutate({ invoice: invoiceData, items: invoiceItems });
  };

  const clearForm = () => {
    setCustomerName("");
    setCustomerPhone("");
    setItems([]);
    setSelectedService("");
    setSelectedServiceType("");
    setQuantity(1);
    setPaymentMethod("pending");
    // Get new invoice number
    queryClient.invalidateQueries({ queryKey: ["/api/invoices/next-number"] });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Invoice Form */}
      <div className="lg:col-span-2">
        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
          <h2 className="text-xl font-semibold text-card-foreground mb-6">Nueva Factura</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Número de Factura
              </label>
              <input
                type="text"
                value={invoiceNumber}
                readOnly
                className="w-full px-4 py-2 border border-border rounded-lg bg-muted text-muted-foreground"
                data-testid="input-invoice-number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">Fecha</label>
              <input
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                data-testid="input-invoice-date"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">Cliente</label>
              <input
                type="text"
                placeholder="Nombre del cliente"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                data-testid="input-customer-name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">Teléfono</label>
              <input
                type="tel"
                placeholder="809-000-0000"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                data-testid="input-customer-phone"
              />
            </div>
          </div>

          {/* Service Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-card-foreground mb-4">Agregar Servicios</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <select 
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                data-testid="select-service"
              >
                <option value="">Seleccionar prenda</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
              
              <select 
                value={selectedServiceType}
                onChange={(e) => setSelectedServiceType(e.target.value)}
                className="px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                data-testid="select-service-type"
              >
                <option value="">Tipo de servicio</option>
                {selectedService && services.find(s => s.id === selectedService) && (
                  <>
                    <option value="wash">
                      Lavado - RD${parseFloat(services.find(s => s.id === selectedService)!.washPrice).toFixed(2)}
                    </option>
                    <option value="iron">
                      Planchado - RD${parseFloat(services.find(s => s.id === selectedService)!.ironPrice).toFixed(2)}
                    </option>
                    <option value="both">
                      Lavado + Planchado - RD${parseFloat(services.find(s => s.id === selectedService)!.bothPrice).toFixed(2)}
                    </option>
                  </>
                )}
              </select>
              
              <input
                type="number"
                placeholder="Cantidad"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                data-testid="input-quantity"
              />
              
              <button 
                onClick={addItem}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center"
                data-testid="button-add-item"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Items List */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-card-foreground mb-4">Artículos</h3>
            {items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground bg-muted rounded-lg">
                <p>No hay artículos agregados</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-muted rounded-lg" data-testid={`item-${item.id}`}>
                    <div className="flex-1">
                      <p className="font-medium text-card-foreground">
                        {item.serviceName} - {getServiceTypeName(item.serviceType)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Cantidad: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right mr-4">
                      <p className="font-medium text-card-foreground">
                        RD${item.total.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        RD${item.unitPrice.toFixed(2)} c/u
                      </p>
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      data-testid={`button-remove-${item.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={handleSave}
              disabled={saveInvoiceMutation.isPending}
              className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 font-medium transition-colors flex items-center justify-center disabled:opacity-50"
              data-testid="button-save-invoice"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveInvoiceMutation.isPending ? "Guardando..." : "Guardar Factura"}
            </button>
            <button 
              onClick={() => onNotification("Preparando impresión...")}
              className="flex-1 bg-secondary text-secondary-foreground py-3 rounded-lg hover:bg-secondary/90 font-medium transition-colors flex items-center justify-center"
              data-testid="button-print-invoice"
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </button>
            <button 
              onClick={clearForm}
              className="flex-1 bg-muted text-muted-foreground py-3 rounded-lg hover:bg-accent font-medium transition-colors"
              data-testid="button-clear-invoice"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Preview */}
      <div className="lg:col-span-1">
        <div className="bg-card rounded-xl shadow-sm border border-border p-6 sticky top-6">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">Resumen</h3>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-medium" data-testid="text-subtotal">RD${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ITBIS (18%):</span>
              <span className="font-medium" data-testid="text-tax">RD${tax.toFixed(2)}</span>
            </div>
            <div className="border-t border-border pt-3">
              <div className="flex justify-between">
                <span className="text-lg font-semibold text-card-foreground">Total:</span>
                <span className="text-lg font-bold text-primary" data-testid="text-total">RD${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-card-foreground">Método de Pago</h4>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="cash" 
                  checked={paymentMethod === "cash"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="text-primary focus:ring-primary" 
                  data-testid="radio-payment-cash"
                />
                <span className="text-sm">Efectivo</span>
              </label>
              <label className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="card" 
                  checked={paymentMethod === "card"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="text-primary focus:ring-primary" 
                  data-testid="radio-payment-card"
                />
                <span className="text-sm">Tarjeta</span>
              </label>
              <label className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="pending" 
                  checked={paymentMethod === "pending"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="text-primary focus:ring-primary" 
                  data-testid="radio-payment-pending"
                />
                <span className="text-sm">Pendiente</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
