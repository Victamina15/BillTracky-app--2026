import { type Employee, type InsertEmployee, type Customer, type InsertCustomer, type Service, type InsertService, type Invoice, type InsertInvoice, type InvoiceItem, type InsertInvoiceItem } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Employees
  getEmployee(id: string): Promise<Employee | undefined>;
  getEmployeeByAccessCode(accessCode: string): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  
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
}

export class MemStorage implements IStorage {
  private employees: Map<string, Employee>;
  private customers: Map<string, Customer>;
  private services: Map<string, Service>;
  private invoices: Map<string, Invoice>;
  private invoiceItems: Map<string, InvoiceItem>;
  private invoiceCounter: number;

  constructor() {
    this.employees = new Map();
    this.customers = new Map();
    this.services = new Map();
    this.invoices = new Map();
    this.invoiceItems = new Map();
    this.invoiceCounter = 10;
    
    this.seedData();
  }

  private seedData() {
    // Seed employees
    const employees = [
      { id: randomUUID(), name: 'Juan Carlos', accessCode: '1234', role: 'manager' },
      { id: randomUUID(), name: 'María Fernández', accessCode: '5678', role: 'employee' },
      { id: randomUUID(), name: 'Pedro González', accessCode: '9999', role: 'supervisor' }
    ];
    employees.forEach(emp => this.employees.set(emp.id, emp));

    // Seed services
    const services = [
      { id: randomUUID(), name: 'PANTALONES', washPrice: '80.00', ironPrice: '60.00', bothPrice: '110.00' },
      { id: randomUUID(), name: 'CAMISAS', washPrice: '60.00', ironPrice: '40.00', bothPrice: '85.00' },
      { id: randomUUID(), name: 'VESTIDOS', washPrice: '150.00', ironPrice: '120.00', bothPrice: '220.00' }
    ];
    services.forEach(service => this.services.set(service.id, service));

    // Seed customers
    const customers = [
      { id: randomUUID(), name: 'Juan Pérez', phone: '809-150-2025', totalSpent: '1240.00', ordersCount: 8 },
      { id: randomUUID(), name: 'María García', phone: '809-555-1234', totalSpent: '890.00', ordersCount: 5 },
      { id: randomUUID(), name: 'Pedro López', phone: '809-777-9999', totalSpent: '650.00', ordersCount: 3 }
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
        date: new Date('2025-09-04'),
        subtotal: '320.00',
        tax: '57.60',
        total: '377.60',
        paymentMethod: 'pending',
        status: 'in_process',
        employeeId: employees[0].id
      },
      {
        id: randomUUID(),
        number: 'FAC-008',
        customerId: customers[1].id,
        customerName: 'María García',
        customerPhone: '809-555-1234',
        date: new Date('2025-09-03'),
        subtotal: '245.76',
        tax: '44.24',
        total: '290.00',
        paymentMethod: 'cash',
        status: 'ready',
        employeeId: employees[1].id
      }
    ];
    sampleInvoices.forEach(invoice => this.invoices.set(invoice.id, invoice));
  }

  // Employee methods
  async getEmployee(id: string): Promise<Employee | undefined> {
    return this.employees.get(id);
  }

  async getEmployeeByAccessCode(accessCode: string): Promise<Employee | undefined> {
    return Array.from(this.employees.values()).find(emp => emp.accessCode === accessCode);
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const id = randomUUID();
    const newEmployee: Employee = { ...employee, id };
    this.employees.set(id, newEmployee);
    return newEmployee;
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
      totalSpent: '0.00',
      ordersCount: 0 
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
    const newService: Service = { ...service, id };
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
      date: invoice.date || new Date()
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
    const number = `FAC-${String(this.invoiceCounter).padStart(3, '0')}`;
    this.invoiceCounter++;
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
}

export const storage = new MemStorage();
