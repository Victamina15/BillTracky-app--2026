import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const employees = pgTable("employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  position: text("position").notNull(),
  accessCode: text("access_code").notNull().unique(),
  role: text("role").notNull(), // 'manager', 'supervisor', 'employee'
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  lastAccess: timestamp("last_access"),
});

export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).default("0"),
  ordersCount: integer("orders_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull().default('Ropa Básica'),
  washPrice: decimal("wash_price", { precision: 10, scale: 2 }).notNull(),
  ironPrice: decimal("iron_price", { precision: 10, scale: 2 }).notNull(),
  bothPrice: decimal("both_price", { precision: 10, scale: 2 }).notNull(),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  number: text("number").notNull().unique(),
  customerId: varchar("customer_id").references(() => customers.id),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),
  date: timestamp("date").defaultNow(),
  deliveryDate: timestamp("delivery_date"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method"), // 'cash', 'card', 'pending'
  status: text("status").default("received"), // 'received', 'in_process', 'ready', 'delivered', 'cancelled'
  employeeId: varchar("employee_id").references(() => employees.id),
  paid: boolean("paid").default(false),
  delivered: boolean("delivered").default(false),
  cancelledAt: timestamp("cancelled_at"),
  cancellationReason: text("cancellation_reason"),
});

export const invoiceItems = pgTable("invoice_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id").references(() => invoices.id).notNull(),
  serviceId: varchar("service_id").references(() => services.id).notNull(),
  serviceName: text("service_name").notNull(),
  serviceType: text("service_type").notNull(), // 'wash', 'iron', 'both'
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
});

export const paymentMethods = pgTable("payment_methods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  active: boolean("active").default(true),
  requiresReference: boolean("requires_reference").default(false),
  commission: decimal("commission", { precision: 5, scale: 2 }).default("0"),
  description: text("description"),
  showOnInvoice: boolean("show_on_invoice").default(true),
  color: text("color").default("#3B82F6"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const companySettings = pgTable("company_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  commercialName: text("commercial_name"),
  email: text("email"),
  phone: text("phone").notNull(),
  phone2: text("phone2"),
  address: text("address"),
  branch: text("branch"),
  city: text("city"),
  province: text("province"),
  postalCode: text("postal_code"),
  rnc: text("rnc"),
  website: text("website"),
  logo: text("logo"),
  invoiceFooter: text("invoice_footer"),
  showRncOnInvoice: boolean("show_rnc_on_invoice").default(true),
  showAddressOnInvoice: boolean("show_address_on_invoice").default(true),
  showPhoneOnInvoice: boolean("show_phone_on_invoice").default(true),
  showEmailOnInvoice: boolean("show_email_on_invoice").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const messageTemplates = pgTable("message_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // 'order_ready', 'invoice_whatsapp', 'reminder', 'pending_payment'
  title: text("title").notNull(),
  message: text("message").notNull(),
  active: boolean("active").default(true),
  autoSend: boolean("auto_send").default(false),
  sendTime: text("send_time"),
  reminderDays: integer("reminder_days"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
  lastAccess: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  totalSpent: true,
  ordersCount: true,
  createdAt: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
});

export const insertInvoiceItemSchema = createInsertSchema(invoiceItems).omit({
  id: true,
});

export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).omit({
  id: true,
  createdAt: true,
});

export const insertCompanySettingsSchema = createInsertSchema(companySettings).omit({
  id: true,
  updatedAt: true,
});

export const insertMessageTemplateSchema = createInsertSchema(messageTemplates).omit({
  id: true,
  updatedAt: true,
});

// Types
export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type InsertInvoiceItem = z.infer<typeof insertInvoiceItemSchema>;

export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;

export type CompanySettings = typeof companySettings.$inferSelect;
export type InsertCompanySettings = z.infer<typeof insertCompanySettingsSchema>;

export type MessageTemplate = typeof messageTemplates.$inferSelect;
export type InsertMessageTemplate = z.infer<typeof insertMessageTemplateSchema>;
