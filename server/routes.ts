import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCustomerSchema, insertServiceSchema, insertInvoiceSchema, insertInvoiceItemSchema } from "@shared/schema";
import { z } from "zod";

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

  app.post("/api/invoices", async (req, res) => {
    try {
      const { invoice: invoiceData, items } = req.body;
      
      // Validate invoice data
      const validatedInvoice = insertInvoiceSchema.parse(invoiceData);
      
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
      
      res.json({ invoice, items: invoiceItems });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
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

  app.put("/api/invoices/:id", async (req, res) => {
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
      const pendingPayment = invoices.filter(inv => inv.paymentMethod === 'pending').length;
      const pendingPaymentTotal = invoices
        .filter(inv => inv.paymentMethod === 'pending')
        .reduce((sum, inv) => sum + parseFloat(inv.total), 0);
      
      res.json({
        todayOrders: todayInvoices.length,
        todayRevenue: todayRevenue.toFixed(2),
        inProgress,
        pendingPayment,
        pendingPaymentTotal: pendingPaymentTotal.toFixed(2)
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
