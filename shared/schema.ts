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
  paymentMethod: text("payment_method"), // 'cash', 'card', 'transfer', 'mobile_pay', 'pending'
  paymentReference: text("payment_reference"), // Referencia opcional para pagos
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

// Planes de suscripción
export const subscriptionPlans = pgTable("subscription_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  billingPeriod: text("billing_period").notNull(), // 'monthly', 'yearly'
  features: text("features").array(), // Array de características
  maxOrganizations: integer("max_organizations").default(1),
  maxUsers: integer("max_users").default(1),
  maxInvoicesPerMonth: integer("max_invoices_per_month"),
  supportLevel: text("support_level").default("basic"), // 'basic', 'priority', 'dedicated'
  active: boolean("active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Organizaciones/Empresas de usuarios
export const organizations = pgTable("organizations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  subdomain: text("subdomain").unique(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  country: text("country").default("Dominican Republic"),
  logo: text("logo"),
  planId: varchar("plan_id").references(() => subscriptionPlans.id),
  subscriptionStatus: text("subscription_status").default("active"), // 'active', 'inactive', 'suspended', 'cancelled'
  subscriptionStartDate: timestamp("subscription_start_date").defaultNow(),
  subscriptionEndDate: timestamp("subscription_end_date"),
  trialStartDate: timestamp("trial_start_date"),
  trialEndDate: timestamp("trial_end_date"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  isTrialActive: boolean("is_trial_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Usuarios externos (clientes del SaaS)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  password: text("password").notNull(), // Hash de la contraseña
  organizationId: varchar("organization_id").references(() => organizations.id),
  role: text("role").default("owner"), // 'owner', 'admin', 'user'
  isActive: boolean("is_active").default(true),
  isEmailVerified: boolean("is_email_verified").default(false),
  emailVerificationToken: text("email_verification_token"),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  lastLoginAt: timestamp("last_login_at"),
  avatar: text("avatar"),
  preferences: text("preferences"), // JSON string de preferencias
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Sesiones de usuarios
export const userSessions = pgTable("user_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
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

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSessionSchema = createInsertSchema(userSessions).omit({
  id: true,
  createdAt: true,
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

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
