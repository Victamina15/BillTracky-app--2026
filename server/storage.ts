import { type Employee, type InsertEmployee, type Customer, type InsertCustomer, type Service, type InsertService, type Invoice, type InsertInvoice, type InvoiceItem, type InsertInvoiceItem, type PaymentMethod, type InsertPaymentMethod, type CompanySettings, type InsertCompanySettings, type MessageTemplate, type InsertMessageTemplate, type Counter, type InsertCounter, employees, customers, services, invoices, invoiceItems, paymentMethods, companySettings, messageTemplates, counters } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Employees
  getEmployee(id: string): Promise<Employee | undefined>;
  getEmployees(): Promise<Employee[]>;
  getEmployeeByAccessCode(accessCode: string): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee | undefined>;
  deleteEmployee(id: string): Promise<void>;
  
  // Customers
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomers(): Promise<Customer[]>;
  getCustomerByPhone(phone: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | undefined>;
  
  // Services
  getService(id: string): Promise<Service | undefined>;
  getServices(): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: string, updates: Partial<Service>): Promise<Service | undefined>;
  
  // Invoices
  getInvoice(id: string): Promise<Invoice | undefined>;
  getInvoices(): Promise<Invoice[]>;
  getInvoicesByCustomer(customerId: string): Promise<Invoice[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice | undefined>;
  getNextInvoiceNumber(): Promise<string>;
  
  // Invoice Items
  getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]>;
  createInvoiceItem(item: InsertInvoiceItem): Promise<InvoiceItem>;
  deleteInvoiceItems(invoiceId: string): Promise<void>;
  
  // Payment Methods
  getPaymentMethods(): Promise<PaymentMethod[]>;
  getPaymentMethod(id: string): Promise<PaymentMethod | undefined>;
  createPaymentMethod(method: InsertPaymentMethod): Promise<PaymentMethod>;
  updatePaymentMethod(id: string, updates: Partial<PaymentMethod>): Promise<PaymentMethod | undefined>;
  deletePaymentMethod(id: string): Promise<void>;
  
  // Company Settings
  getCompanySettings(): Promise<CompanySettings | undefined>;
  updateCompanySettings(settings: InsertCompanySettings): Promise<CompanySettings>;
  
  // Message Templates
  getMessageTemplates(): Promise<MessageTemplate[]>;
  getMessageTemplate(id: string): Promise<MessageTemplate | undefined>;
  getMessageTemplateByType(type: string): Promise<MessageTemplate | undefined>;
  createMessageTemplate(template: InsertMessageTemplate): Promise<MessageTemplate>;
  updateMessageTemplate(id: string, updates: Partial<MessageTemplate>): Promise<MessageTemplate | undefined>;
}

export class MemStorage implements IStorage {
  private employees: Map<string, Employee>;
  private customers: Map<string, Customer>;
  private services: Map<string, Service>;
  private invoices: Map<string, Invoice>;
  private invoiceItems: Map<string, InvoiceItem>;
  private paymentMethods: Map<string, PaymentMethod>;
  private companySettings: CompanySettings | undefined;
  private messageTemplates: Map<string, MessageTemplate>;
  private invoiceCounter: number;

  constructor() {
    this.employees = new Map();
    this.customers = new Map();
    this.services = new Map();
    this.invoices = new Map();
    this.invoiceItems = new Map();
    this.paymentMethods = new Map();
    this.messageTemplates = new Map();
    this.invoiceCounter = 10;
    
    this.seedData();
  }

  private seedData() {
    // Seed employees
    const employees = [
      { id: randomUUID(), name: 'Juan Carlos', position: 'Gerente General', accessCode: '1234', role: 'manager', active: true, createdAt: new Date('2024-01-15'), lastAccess: new Date('2024-09-04') },
      { id: randomUUID(), name: 'María Fernández', position: 'Operadora Principal', accessCode: '5678', role: 'employee', active: true, createdAt: new Date('2024-02-20'), lastAccess: new Date('2024-09-03') },
      { id: randomUUID(), name: 'Pedro González', position: 'Supervisor de Turno', accessCode: '9999', role: 'supervisor', active: true, createdAt: new Date('2024-03-10'), lastAccess: new Date('2024-09-02') }
    ];
    employees.forEach(emp => this.employees.set(emp.id, emp));

    // Seed services
    const services = [
      { id: randomUUID(), name: 'PANTALONES', category: 'Ropa Básica', washPrice: '80.00', ironPrice: '60.00', bothPrice: '110.00', active: true, createdAt: new Date('2024-01-15') },
      { id: randomUUID(), name: 'CAMISAS', category: 'Ropa Básica', washPrice: '60.00', ironPrice: '40.00', bothPrice: '85.00', active: true, createdAt: new Date('2024-01-15') },
      { id: randomUUID(), name: 'VESTIDOS', category: 'Ropa Especial', washPrice: '150.00', ironPrice: '120.00', bothPrice: '220.00', active: true, createdAt: new Date('2024-01-15') },
      { id: randomUUID(), name: 'BLUSAS', category: 'Ropa Básica', washPrice: '60.00', ironPrice: '40.00', bothPrice: '85.00', active: true, createdAt: new Date('2024-01-15') },
      { id: randomUUID(), name: 'SÁBANAS', category: 'Hogar', washPrice: '100.00', ironPrice: '80.00', bothPrice: '150.00', active: true, createdAt: new Date('2024-01-15') },
      { id: randomUUID(), name: 'TOALLAS (GRANDE)', category: 'Hogar', washPrice: '40.00', ironPrice: '30.00', bothPrice: '60.00', active: true, createdAt: new Date('2024-01-15') }
    ];
    services.forEach(service => this.services.set(service.id, service));

    // Seed customers
    const customers = [
      { id: randomUUID(), name: 'Juan Pérez', phone: '809-150-2025', email: 'juan@email.com', totalSpent: '1240.00', ordersCount: 8, createdAt: new Date('2024-01-10') },
      { id: randomUUID(), name: 'María García', phone: '809-555-1234', email: 'maria@email.com', totalSpent: '890.00', ordersCount: 5, createdAt: new Date('2024-02-15') },
      { id: randomUUID(), name: 'Pedro López', phone: '809-777-9999', email: null, totalSpent: '650.00', ordersCount: 3, createdAt: new Date('2024-03-01') }
    ];
    customers.forEach(customer => this.customers.set(customer.id, customer));

    // Seed some sample invoices
    const sampleInvoices = [
      {
        id: randomUUID(),
        number: 'FAC-009',
        customerId: customers[0].id,
        customerName: 'Juan Pérez',
        customerPhone: '809-150-2025',
        customerEmail: 'juan@email.com',
        deliveryDate: new Date('2025-09-06'),
        date: new Date('2025-09-04'),
        subtotal: '320.00',
        tax: '57.60',
        total: '377.60',
        paymentMethod: 'pending',
        paymentReference: null,
        status: 'in_process',
        employeeId: employees[0].id,
        paid: false,
        delivered: false,
        cancelledAt: null,
        cancellationReason: null
      },
      {
        id: randomUUID(),
        number: 'FAC-008',
        customerId: customers[1].id,
        customerName: 'María García',
        customerPhone: '809-555-1234',
        customerEmail: 'maria@email.com',
        deliveryDate: new Date('2025-09-05'),
        date: new Date('2025-09-03'),
        subtotal: '245.76',
        tax: '44.24',
        total: '290.00',
        paymentMethod: 'cash',
        paymentReference: null,
        status: 'ready',
        employeeId: employees[1].id,
        paid: true,
        delivered: false,
        cancelledAt: null,
        cancellationReason: null
      }
    ];
    sampleInvoices.forEach(invoice => this.invoices.set(invoice.id, invoice));

    // Seed payment methods
    const paymentMethods = [
      {
        id: randomUUID(),
        name: 'Efectivo',
        code: 'cash',
        icon: '💵',
        active: true,
        requiresReference: false,
        commission: '0',
        description: 'Pago en efectivo',
        showOnInvoice: true,
        color: '#10B981',
        createdAt: new Date()
      },
      {
        id: randomUUID(),
        name: 'Tarjeta de Crédito',
        code: 'card',
        icon: '💳',
        active: true,
        requiresReference: true,
        commission: '3.5',
        description: 'Visa, Mastercard, American Express',
        showOnInvoice: true,
        color: '#3B82F6',
        createdAt: new Date()
      },
      {
        id: randomUUID(),
        name: 'Transferencia Bancaria',
        code: 'transfer',
        icon: '🏦',
        active: true,
        requiresReference: true,
        commission: '0',
        description: 'Transferencia entre cuentas',
        showOnInvoice: true,
        color: '#F59E0B',
        createdAt: new Date()
      },
      {
        id: randomUUID(),
        name: 'Pago Móvil',
        code: 'mobile_pay',
        icon: '📱',
        active: true,
        requiresReference: true,
        commission: '0',
        description: 'Pago móvil bancario',
        showOnInvoice: true,
        color: '#8B5CF6',
        createdAt: new Date()
      }
    ];
    paymentMethods.forEach(method => this.paymentMethods.set(method.id, method));

    // Seed company settings
    this.companySettings = {
      id: randomUUID(),
      name: 'CleanWash Lavandería',
      commercialName: 'CleanWash',
      email: 'admin@cleanwash.com',
      phone: '809-555-0123',
      phone2: '809-555-0124',
      address: 'Av. Principal #123, Santo Domingo',
      branch: 'Sucursal Centro',
      city: 'Santo Domingo',
      province: 'Distrito Nacional',
      postalCode: '10101',
      rnc: '131-12345-6',
      website: 'www.cleanwash.com',
      logo: null,
      invoiceFooter: 'Gracias por preferirnos - CleanWash Lavandería',
      showRncOnInvoice: true,
      showAddressOnInvoice: true,
      showPhoneOnInvoice: true,
      showEmailOnInvoice: true,
      updatedAt: new Date()
    };

    // Seed message templates
    const messageTemplates = [
      {
        id: randomUUID(),
        type: 'order_ready',
        title: '🎉 ¡Tu pedido está listo!',
        message: 'Hola {cliente_nombre}! 👋\n\n¡Excelentes noticias! Tu pedido #{factura_numero} está listo para recoger.\n\n📋 *Detalles del pedido:*\n• Fecha de entrega: {fecha_entrega}\n• Total de prendas: {total_prendas}\n• Total a pagar: RD$ {total_pagar}\n\n🏪 *Información de recogida:*\n• Dirección: {empresa_direccion}\n• Horario: {empresa_horario}\n• Teléfono: {empresa_telefono}\n\n¡Gracias por confiar en nosotros! ✨\n\n_{empresa_nombre}_',
        active: true,
        autoSend: true,
        sendTime: '09:00',
        reminderDays: null,
        updatedAt: new Date()
      },
      {
        id: randomUUID(),
        type: 'invoice_whatsapp',
        title: '📄 Factura de tu pedido',
        message: 'Hola {cliente_nombre}! 👋\n\nAquí tienes la factura de tu pedido #{factura_numero}\n\n📋 *Resumen del pedido:*\n• Fecha: {fecha_factura}\n• Prendas: {total_prendas}\n• Subtotal: RD$ {subtotal}\n• ITBIS (18%): RD$ {itbis}\n• *Total: RD$ {total}*\n\n💳 *Estado del pago:* {estado_pago}\n📅 *Fecha de entrega:* {fecha_entrega}\n\n{detalles_articulos}\n\n¡Gracias por elegirnos! 🙏\n\n_{empresa_nombre}_\n📍 {empresa_direccion}\n📞 {empresa_telefono}',
        active: true,
        autoSend: false,
        sendTime: null,
        reminderDays: null,
        updatedAt: new Date()
      }
    ];
    messageTemplates.forEach(template => this.messageTemplates.set(template.id, template));
  }

  // Employee methods
  async getEmployee(id: string): Promise<Employee | undefined> {
    return this.employees.get(id);
  }

  async getEmployeeByAccessCode(accessCode: string): Promise<Employee | undefined> {
    return Array.from(this.employees.values()).find(emp => emp.accessCode === accessCode);
  }

  async getEmployees(): Promise<Employee[]> {
    return Array.from(this.employees.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const id = randomUUID();
    const newEmployee: Employee = { 
      ...employee, 
      id,
      active: employee.active ?? true,
      createdAt: new Date(),
      lastAccess: null
    };
    this.employees.set(id, newEmployee);
    return newEmployee;
  }

  async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee | undefined> {
    const employee = this.employees.get(id);
    if (!employee) return undefined;
    
    const updated = { ...employee, ...updates };
    this.employees.set(id, updated);
    return updated;
  }

  async deleteEmployee(id: string): Promise<void> {
    this.employees.delete(id);
  }

  // Customer methods
  async getCustomer(id: string): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async getCustomerByPhone(phone: string): Promise<Customer | undefined> {
    return Array.from(this.customers.values()).find(customer => customer.phone === phone);
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const id = randomUUID();
    const newCustomer: Customer = { 
      ...customer, 
      id, 
      email: customer.email ?? null,
      totalSpent: '0.00',
      ordersCount: 0,
      createdAt: new Date()
    };
    this.customers.set(id, newCustomer);
    return newCustomer;
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | undefined> {
    const customer = this.customers.get(id);
    if (!customer) return undefined;
    
    const updated = { ...customer, ...updates };
    this.customers.set(id, updated);
    return updated;
  }

  // Service methods
  async getService(id: string): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async getServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }

  async createService(service: InsertService): Promise<Service> {
    const id = randomUUID();
    const newService: Service = {
      ...service,
      id,
      active: service.active ?? true,
      category: service.category ?? 'Ropa Básica',
      createdAt: new Date()
    };
    this.services.set(id, newService);
    return newService;
  }

  async updateService(id: string, updates: Partial<Service>): Promise<Service | undefined> {
    const service = this.services.get(id);
    if (!service) return undefined;
    
    const updated = { ...service, ...updates };
    this.services.set(id, updated);
    return updated;
  }

  // Invoice methods
  async getInvoice(id: string): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }

  async getInvoices(): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).sort((a, b) => 
      new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
    );
  }

  async getInvoicesByCustomer(customerId: string): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).filter(invoice => invoice.customerId === customerId);
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const id = randomUUID();
    const newInvoice: Invoice = {
      ...invoice,
      id,
      customerId: invoice.customerId ?? null,
      customerEmail: invoice.customerEmail ?? null,
      deliveryDate: invoice.deliveryDate ?? null,
      paymentMethod: invoice.paymentMethod ?? null,
      paymentReference: invoice.paymentReference ?? null,
      date: invoice.date || new Date(),
      status: invoice.status || 'received',
      employeeId: invoice.employeeId ?? null,
      paid: invoice.paid ?? false,
      delivered: invoice.delivered ?? false,
      cancelledAt: invoice.cancelledAt ?? null,
      cancellationReason: invoice.cancellationReason ?? null
    };
    this.invoices.set(id, newInvoice);
    return newInvoice;
  }

  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice | undefined> {
    const invoice = this.invoices.get(id);
    if (!invoice) return undefined;
    
    const updated = { ...invoice, ...updates };
    this.invoices.set(id, updated);
    return updated;
  }

  async getNextInvoiceNumber(): Promise<string> {
    // Incrementar primero para evitar race conditions
    const nextNumber = this.invoiceCounter++;
    const number = `FAC-${String(nextNumber).padStart(3, '0')}`;
    return number;
  }

  // Invoice Item methods
  async getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]> {
    return Array.from(this.invoiceItems.values()).filter(item => item.invoiceId === invoiceId);
  }

  async createInvoiceItem(item: InsertInvoiceItem): Promise<InvoiceItem> {
    const id = randomUUID();
    const newItem: InvoiceItem = { ...item, id };
    this.invoiceItems.set(id, newItem);
    return newItem;
  }

  async deleteInvoiceItems(invoiceId: string): Promise<void> {
    const items = await this.getInvoiceItems(invoiceId);
    items.forEach(item => this.invoiceItems.delete(item.id));
  }

  // Payment Methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return Array.from(this.paymentMethods.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async getPaymentMethod(id: string): Promise<PaymentMethod | undefined> {
    return this.paymentMethods.get(id);
  }

  async createPaymentMethod(method: InsertPaymentMethod): Promise<PaymentMethod> {
    const id = randomUUID();
    const newMethod: PaymentMethod = { 
      ...method, 
      id,
      active: method.active ?? true,
      requiresReference: method.requiresReference ?? false,
      commission: method.commission ?? '0',
      description: method.description ?? null,
      showOnInvoice: method.showOnInvoice ?? true,
      color: method.color ?? '#3B82F6',
      createdAt: new Date()
    };
    this.paymentMethods.set(id, newMethod);
    return newMethod;
  }

  async updatePaymentMethod(id: string, updates: Partial<PaymentMethod>): Promise<PaymentMethod | undefined> {
    const method = this.paymentMethods.get(id);
    if (!method) return undefined;
    
    const updated = { ...method, ...updates };
    this.paymentMethods.set(id, updated);
    return updated;
  }

  async deletePaymentMethod(id: string): Promise<void> {
    this.paymentMethods.delete(id);
  }

  // Company Settings
  async getCompanySettings(): Promise<CompanySettings | undefined> {
    return this.companySettings;
  }

  async updateCompanySettings(settings: InsertCompanySettings): Promise<CompanySettings> {
    const updated: CompanySettings = {
      ...settings,
      id: this.companySettings?.id || randomUUID(),
      email: settings.email ?? null,
      commercialName: settings.commercialName ?? null,
      phone2: settings.phone2 ?? null,
      address: settings.address ?? null,
      branch: settings.branch ?? null,
      city: settings.city ?? null,
      province: settings.province ?? null,
      postalCode: settings.postalCode ?? null,
      rnc: settings.rnc ?? null,
      website: settings.website ?? null,
      logo: settings.logo ?? null,
      invoiceFooter: settings.invoiceFooter ?? null,
      showRncOnInvoice: settings.showRncOnInvoice ?? true,
      showAddressOnInvoice: settings.showAddressOnInvoice ?? true,
      showPhoneOnInvoice: settings.showPhoneOnInvoice ?? true,
      showEmailOnInvoice: settings.showEmailOnInvoice ?? true,
      updatedAt: new Date()
    };
    this.companySettings = updated;
    return updated;
  }

  // Message Templates
  async getMessageTemplates(): Promise<MessageTemplate[]> {
    return Array.from(this.messageTemplates.values()).sort((a, b) => a.type.localeCompare(b.type));
  }

  async getMessageTemplate(id: string): Promise<MessageTemplate | undefined> {
    return this.messageTemplates.get(id);
  }

  async getMessageTemplateByType(type: string): Promise<MessageTemplate | undefined> {
    return Array.from(this.messageTemplates.values()).find(template => template.type === type);
  }

  async createMessageTemplate(template: InsertMessageTemplate): Promise<MessageTemplate> {
    const id = randomUUID();
    const newTemplate: MessageTemplate = { 
      ...template, 
      id,
      active: template.active ?? true,
      autoSend: template.autoSend ?? false,
      sendTime: template.sendTime ?? null,
      reminderDays: template.reminderDays ?? null,
      updatedAt: new Date()
    };
    this.messageTemplates.set(id, newTemplate);
    return newTemplate;
  }

  async updateMessageTemplate(id: string, updates: Partial<MessageTemplate>): Promise<MessageTemplate | undefined> {
    const template = this.messageTemplates.get(id);
    if (!template) return undefined;
    
    const updated = { ...template, ...updates, updatedAt: new Date() };
    this.messageTemplates.set(id, updated);
    return updated;
  }
}

// DatabaseStorage implementation using PostgreSQL with Drizzle ORM
export class DatabaseStorage implements IStorage {
  // Employees
  async getEmployee(id: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee || undefined;
  }

  async getEmployees(): Promise<Employee[]> {
    return await db.select().from(employees);
  }

  async getEmployeeByAccessCode(accessCode: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.accessCode, accessCode));
    return employee || undefined;
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const [newEmployee] = await db.insert(employees).values(employee).returning();
    return newEmployee;
  }

  async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee | undefined> {
    const [updated] = await db.update(employees)
      .set({ ...updates, lastAccess: new Date() })
      .where(eq(employees.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteEmployee(id: string): Promise<void> {
    await db.delete(employees).where(eq(employees.id, id));
  }

  // Customers
  async getCustomer(id: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }

  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers);
  }

  async getCustomerByPhone(phone: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.phone, phone));
    return customer || undefined;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | undefined> {
    const [updated] = await db.update(customers)
      .set(updates)
      .where(eq(customers.id, id))
      .returning();
    return updated || undefined;
  }

  // Services
  async getService(id: string): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service || undefined;
  }

  async getServices(): Promise<Service[]> {
    return await db.select().from(services);
  }

  async createService(service: InsertService): Promise<Service> {
    const [newService] = await db.insert(services).values(service).returning();
    return newService;
  }

  async updateService(id: string, updates: Partial<Service>): Promise<Service | undefined> {
    const [updated] = await db.update(services)
      .set(updates)
      .where(eq(services.id, id))
      .returning();
    return updated || undefined;
  }

  // Invoices
  async getInvoice(id: string): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice || undefined;
  }

  async getInvoices(): Promise<Invoice[]> {
    return await db.select().from(invoices).orderBy(desc(invoices.date));
  }

  async getInvoicesByCustomer(customerId: string): Promise<Invoice[]> {
    return await db.select().from(invoices)
      .where(eq(invoices.customerId, customerId))
      .orderBy(desc(invoices.date));
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [newInvoice] = await db.insert(invoices).values(invoice).returning();
    return newInvoice;
  }

  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice | undefined> {
    const [updated] = await db.update(invoices)
      .set(updates)
      .where(eq(invoices.id, id))
      .returning();
    return updated || undefined;
  }

  async getNextInvoiceNumber(): Promise<string> {
    console.log('[DEBUG] Generating next invoice number...');
    const counterId = 'invoice_number';
    
    try {
      // Intentar crear el contador si no existe (usando INSERT ... ON CONFLICT DO NOTHING)
      // Esto evita el race condition en la inicialización
      const existingInvoices = await db
        .select({ count: sql<number>`count(*)` })
        .from(invoices);
      const currentCount = existingInvoices[0]?.count || 0;
      
      console.log(`[DEBUG] Current invoice count: ${currentCount}`);
      
      // Usar raw SQL para INSERT ... ON CONFLICT DO NOTHING 
      await db.execute(sql`
        INSERT INTO counters (id, value, updated_at) 
        VALUES (${counterId}, ${currentCount}, NOW()) 
        ON CONFLICT (id) DO NOTHING
      `);
      
      // Incrementar contador de manera atómica usando UPDATE con RETURNING
      const result = await db.execute(sql`
        UPDATE counters 
        SET value = value + 1, updated_at = NOW() 
        WHERE id = ${counterId} 
        RETURNING value
      `);
      
      const updatedValue = result.rows[0]?.value;
      console.log(`[DEBUG] Updated counter value: ${updatedValue}`);
      
      if (!updatedValue) {
        throw new Error(`Failed to update counter for ${counterId}`);
      }
      
      const invoiceNumber = `FAC-${String(updatedValue).padStart(3, '0')}`;
      console.log(`[DEBUG] Generated invoice number: ${invoiceNumber}`);
      
      return invoiceNumber;
    } catch (error) {
      console.error('[ERROR] Failed to generate invoice number:', error);
      throw error;
    }
  }

  // Invoice Items
  async getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]> {
    return await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
  }

  async createInvoiceItem(item: InsertInvoiceItem): Promise<InvoiceItem> {
    const [newItem] = await db.insert(invoiceItems).values(item).returning();
    return newItem;
  }

  async deleteInvoiceItems(invoiceId: string): Promise<void> {
    await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
  }

  // Payment Methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return await db.select().from(paymentMethods).where(eq(paymentMethods.active, true));
  }

  async getPaymentMethod(id: string): Promise<PaymentMethod | undefined> {
    const [method] = await db.select().from(paymentMethods).where(eq(paymentMethods.id, id));
    return method || undefined;
  }

  async createPaymentMethod(method: InsertPaymentMethod): Promise<PaymentMethod> {
    const [newMethod] = await db.insert(paymentMethods).values(method).returning();
    return newMethod;
  }

  async updatePaymentMethod(id: string, updates: Partial<PaymentMethod>): Promise<PaymentMethod | undefined> {
    const [updated] = await db.update(paymentMethods)
      .set(updates)
      .where(eq(paymentMethods.id, id))
      .returning();
    return updated || undefined;
  }

  async deletePaymentMethod(id: string): Promise<void> {
    await db.delete(paymentMethods).where(eq(paymentMethods.id, id));
  }

  // Company Settings
  async getCompanySettings(): Promise<CompanySettings | undefined> {
    const [settings] = await db.select().from(companySettings).limit(1);
    return settings || undefined;
  }

  async updateCompanySettings(settings: InsertCompanySettings): Promise<CompanySettings> {
    // First, try to get existing settings
    const existing = await this.getCompanySettings();
    
    if (existing) {
      // Update existing settings
      const [updated] = await db.update(companySettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(companySettings.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new settings
      const [newSettings] = await db.insert(companySettings).values(settings).returning();
      return newSettings;
    }
  }

  // Message Templates
  async getMessageTemplates(): Promise<MessageTemplate[]> {
    return await db.select().from(messageTemplates);
  }

  async getMessageTemplate(id: string): Promise<MessageTemplate | undefined> {
    const [template] = await db.select().from(messageTemplates).where(eq(messageTemplates.id, id));
    return template || undefined;
  }

  async getMessageTemplateByType(type: string): Promise<MessageTemplate | undefined> {
    const [template] = await db.select().from(messageTemplates).where(eq(messageTemplates.type, type));
    return template || undefined;
  }

  async createMessageTemplate(template: InsertMessageTemplate): Promise<MessageTemplate> {
    const [newTemplate] = await db.insert(messageTemplates).values(template).returning();
    return newTemplate;
  }

  async updateMessageTemplate(id: string, updates: Partial<MessageTemplate>): Promise<MessageTemplate | undefined> {
    const [updated] = await db.update(messageTemplates)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(messageTemplates.id, id))
      .returning();
    return updated || undefined;
  }
}

export const storage = new DatabaseStorage();
