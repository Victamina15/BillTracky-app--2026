import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCustomerSchema, insertServiceSchema, insertInvoiceSchema, insertInvoiceItemSchema, insertPaymentMethodSchema, insertCompanySettingsSchema, insertMessageTemplateSchema, insertEmployeeSchema, patchOrderStatusSchema, patchOrderPaymentSchema, patchOrderCancelSchema, patchInvoicePaySchema } from "@shared/schema";
import { z } from "zod";

// Authentication middleware
interface AuthenticatedRequest extends Request {
  employee?: any;
}

async function requireAuthentication(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const employeeId = req.headers['x-employee-id'] as string;
    const accessCode = req.headers['x-access-code'] as string;
    
    if (!employeeId && !accessCode) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    let employee;
    if (employeeId) {
      employee = await storage.getEmployee(employeeId);
    } else if (accessCode) {
      employee = await storage.getEmployeeByAccessCode(accessCode);
    }
    
    if (!employee || !employee.active) {
      return res.status(401).json({ message: "Invalid or inactive employee" });
    }
    
    req.employee = employee;
    next();
  } catch (error) {
    res.status(500).json({ message: "Authentication error" });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { accessCode } = req.body;
      const employee = await storage.getEmployeeByAccessCode(accessCode);
      
      if (!employee) {
        return res.status(401).json({ message: "Invalid access code" });
      }
      
      res.json({ employee });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Services
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/services", async (req, res) => {
    try {
      const serviceData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(serviceData);
      res.json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/services/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const service = await storage.updateService(id, updates);
      
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      res.json(service);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Customers
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      res.json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/customers/phone/:phone", async (req, res) => {
    try {
      const { phone } = req.params;
      const customer = await storage.getCustomerByPhone(phone);
      res.json(customer || null);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Invoices
  app.get("/api/invoices", async (req, res) => {
    try {
      const invoices = await storage.getInvoices();
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/invoices/next-number", async (req, res) => {
    try {
      const number = await storage.getNextInvoiceNumber();
      res.json({ number });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/invoices", requireAuthentication, async (req: AuthenticatedRequest, res) => {
    try {
      const { invoice: invoiceData, items } = req.body;
      
      // Parse string dates back to Date objects (JSON.stringify converts Date to string)
      const processedInvoiceData = {
        ...invoiceData,
        date: invoiceData.date ? new Date(invoiceData.date) : undefined,
        deliveryDate: invoiceData.deliveryDate ? new Date(invoiceData.deliveryDate) : null,
      };
      
      // Generate a new invoice number atomically (ignore the one from frontend)
      console.log('[DEBUG] Generating new invoice number for creation...');
      const uniqueInvoiceNumber = await storage.getNextInvoiceNumber();
      console.log(`[DEBUG] Generated unique invoice number: ${uniqueInvoiceNumber}`);
      
      // Override the invoice number with the newly generated one
      const invoiceWithUniqueNumber = {
        ...processedInvoiceData,
        number: uniqueInvoiceNumber
      };
      
      // Validate invoice data
      const validatedInvoice = insertInvoiceSchema.parse(invoiceWithUniqueNumber);
      
      // Create invoice
      const invoice = await storage.createInvoice(validatedInvoice);
      
      // Create invoice items
      const invoiceItems = [];
      for (const itemData of items) {
        const validatedItem = insertInvoiceItemSchema.parse({
          ...itemData,
          invoiceId: invoice.id
        });
        const item = await storage.createInvoiceItem(validatedItem);
        invoiceItems.push(item);
      }

      // Update customer if exists
      if (invoice.customerId) {
        const customer = await storage.getCustomer(invoice.customerId);
        if (customer) {
          await storage.updateCustomer(invoice.customerId, {
            totalSpent: (parseFloat(customer.totalSpent || "0") + parseFloat(invoice.total)).toFixed(2),
            ordersCount: (customer.ordersCount || 0) + 1
          });
        }
      }
      
      res.status(201).json({ invoice, items: invoiceItems });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Invoice creation error:", (error as Error).message);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/invoices/:id/items", async (req, res) => {
    try {
      const { id } = req.params;
      const items = await storage.getInvoiceItems(id);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/invoices/:id", requireAuthentication, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const invoice = await storage.updateInvoice(id, updates);
      
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Finalize payment for draft invoices
  app.patch("/api/invoices/:id/pay", requireAuthentication, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      
      // Validate request body
      const validationResult = patchInvoicePaySchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: validationResult.error.errors 
        });
      }
      
      const { paymentMethod, paymentReference } = validationResult.data;
      
      // Check if invoice exists and is unpaid
      const invoice = await storage.getInvoice(id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      if (invoice.paid) {
        return res.status(400).json({ message: "Invoice is already paid" });
      }
      
      // Update invoice to mark as paid
      const updatedInvoice = await storage.updateInvoice(id, {
        paid: true,
        paymentMethod,
        paymentReference: paymentReference || null,
      });
      
      console.log(`[DEBUG] Invoice ${invoice.number} finalized with payment method: ${paymentMethod}`);
      
      res.json(updatedInvoice);
    } catch (error) {
      console.error("Error finalizing invoice payment:", (error as Error).message);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Order Management - PATCH routes for status updates
  
  // Change order status
  app.patch("/api/invoices/:id/status", requireAuthentication, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      
      // Validate request body with Zod
      const validationResult = patchOrderStatusSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: validationResult.error.errors 
        });
      }
      
      const { status } = validationResult.data;
      
      const invoice = await storage.getInvoice(id);
      if (!invoice) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Validate status transitions
      const currentStatus = invoice.status;
      const validTransitions: Record<string, string[]> = {
        'received': ['in_process', 'cancelled'],
        'in_process': ['ready', 'cancelled'],
        'ready': ['delivered', 'in_process'],
        'delivered': [], // Final status
        'cancelled': [] // Final status
      };
      
      if (currentStatus && !validTransitions[currentStatus]?.includes(status)) {
        return res.status(400).json({ 
          message: `Invalid transition from ${currentStatus} to ${status}` 
        });
      }
      
      // Update status and set delivered flag and delivery date if delivered
      const updates: any = { status, employeeId: req.employee.id };
      if (status === 'delivered') {
        updates.delivered = true;
        updates.deliveryDate = new Date();
      }
      
      const updatedInvoice = await storage.updateInvoice(id, updates);
      res.json(updatedInvoice);
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Process payment
  app.patch("/api/invoices/:id/payment", requireAuthentication, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      
      // Validate request body with Zod
      const validationResult = patchOrderPaymentSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: validationResult.error.errors 
        });
      }
      
      const { paymentMethod, paymentReference } = validationResult.data;
      
      // Get payment methods dynamically from storage
      const availablePaymentMethods = await storage.getPaymentMethods();
      const activePaymentMethods = availablePaymentMethods.filter(method => method.active);
      
      // Validate payment method by name
      const selectedPaymentMethod = activePaymentMethods.find(method => 
        method.name.toLowerCase() === paymentMethod.toLowerCase()
      );
      
      if (!selectedPaymentMethod) {
        const availableNames = activePaymentMethods.map(method => method.name);
        return res.status(400).json({ 
          message: "Invalid payment method", 
          available: availableNames 
        });
      }
      
      // Validate payment reference for methods that require it
      if (selectedPaymentMethod.requiresReference && !paymentReference) {
        return res.status(400).json({ 
          message: `Payment reference is required for ${selectedPaymentMethod.name}` 
        });
      }
      
      const invoice = await storage.getInvoice(id);
      if (!invoice) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Cannot process payment for cancelled orders
      if (invoice.status === 'cancelled') {
        return res.status(400).json({ 
          message: "Cannot process payment for cancelled orders" 
        });
      }
      
      // Prevent re-payment unless explicitly allowed (already paid orders)
      if (invoice.paid) {
        return res.status(400).json({ 
          message: "Order has already been paid. Contact supervisor to modify payment details." 
        });
      }
      
      const updates = {
        paymentMethod: selectedPaymentMethod.name,
        paymentReference: paymentReference || null,
        paid: true,
        employeeId: req.employee.id
      };
      
      const updatedInvoice = await storage.updateInvoice(id, updates);
      res.json(updatedInvoice);
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Cancel order
  app.patch("/api/invoices/:id/cancel", requireAuthentication, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      
      // Validate request body with Zod
      const validationResult = patchOrderCancelSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: validationResult.error.errors 
        });
      }
      
      const { reason } = validationResult.data;
      
      const invoice = await storage.getInvoice(id);
      if (!invoice) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Cannot cancel delivered orders
      if (invoice.status === 'delivered') {
        return res.status(400).json({ 
          message: "Cannot cancel delivered orders" 
        });
      }
      
      // Already cancelled
      if (invoice.status === 'cancelled') {
        return res.status(400).json({ 
          message: "Order is already cancelled" 
        });
      }
      
      const updates = {
        status: 'cancelled' as const,
        cancelledAt: new Date(),
        cancellationReason: reason,
        employeeId: req.employee.id
      };
      
      const updatedInvoice = await storage.updateInvoice(id, updates);
      res.json(updatedInvoice);
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  // Dashboard metrics
  app.get("/api/metrics/dashboard", async (req, res) => {
    try {
      const invoices = await storage.getInvoices();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.date || 0);
        invDate.setHours(0, 0, 0, 0);
        return invDate.getTime() === today.getTime();
      });
      
      const todayRevenue = todayInvoices.reduce((sum, inv) => sum + parseFloat(inv.total), 0);
      const inProgress = invoices.filter(inv => inv.status === 'in_process').length;
      const readyForDelivery = invoices.filter(inv => inv.status === 'ready').length;
      const pendingPayment = invoices.filter(inv => inv.paymentMethod === 'pending').length;
      const pendingPaymentTotal = invoices
        .filter(inv => inv.paymentMethod === 'pending')
        .reduce((sum, inv) => sum + parseFloat(inv.total), 0);
      
      res.json({
        todayOrders: todayInvoices.length,
        todayRevenue: todayRevenue.toFixed(2),
        inProgress,
        readyForDelivery,
        pendingPayment,
        pendingPaymentTotal: pendingPaymentTotal.toFixed(2)
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Payment Methods
  app.get("/api/payment-methods", async (req, res) => {
    try {
      const paymentMethods = await storage.getPaymentMethods();
      res.json(paymentMethods);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/payment-methods", async (req, res) => {
    try {
      const methodData = insertPaymentMethodSchema.parse(req.body);
      const method = await storage.createPaymentMethod(methodData);
      res.json(method);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/payment-methods/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const method = await storage.updatePaymentMethod(id, updates);
      
      if (!method) {
        return res.status(404).json({ message: "Payment method not found" });
      }
      
      res.json(method);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/payment-methods/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deletePaymentMethod(id);
      res.json({ message: "Payment method deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Company Settings
  app.get("/api/company-settings", async (req, res) => {
    try {
      const settings = await storage.getCompanySettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/company-settings", async (req, res) => {
    try {
      const settingsData = insertCompanySettingsSchema.parse(req.body);
      const settings = await storage.updateCompanySettings(settingsData);
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  // Message Templates
  app.get("/api/message-templates", async (req, res) => {
    try {
      const templates = await storage.getMessageTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/message-templates/type/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const template = await storage.getMessageTemplateByType(type);
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/message-templates", async (req, res) => {
    try {
      const templateData = insertMessageTemplateSchema.parse(req.body);
      const template = await storage.createMessageTemplate(templateData);
      res.json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/message-templates/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const template = await storage.updateMessageTemplate(id, updates);
      
      if (!template) {
        return res.status(404).json({ message: "Message template not found" });
      }
      
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Employee management routes
  app.get("/api/employees", async (req, res) => {
    try {
      // Get all employees (for employee management)
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/employees", async (req, res) => {
    try {
      const employeeData = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(employeeData);
      res.json(employee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/employees/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const employee = await storage.updateEmployee(id, updates);
      
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      
      res.json(employee);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/employees/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteEmployee(id);
      res.json({ message: "Employee deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
