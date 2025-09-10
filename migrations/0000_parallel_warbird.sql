CREATE TABLE "company_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"commercial_name" text,
	"email" text,
	"phone" text NOT NULL,
	"phone2" text,
	"address" text,
	"branch" text,
	"city" text,
	"province" text,
	"postal_code" text,
	"rnc" text,
	"website" text,
	"logo" text,
	"invoice_footer" text,
	"show_rnc_on_invoice" boolean DEFAULT true,
	"show_address_on_invoice" boolean DEFAULT true,
	"show_phone_on_invoice" boolean DEFAULT true,
	"show_email_on_invoice" boolean DEFAULT true,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"total_spent" numeric(10, 2) DEFAULT '0',
	"orders_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"position" text NOT NULL,
	"access_code" text NOT NULL,
	"role" text NOT NULL,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"last_access" timestamp,
	CONSTRAINT "employees_access_code_unique" UNIQUE("access_code")
);
--> statement-breakpoint
CREATE TABLE "invoice_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" varchar NOT NULL,
	"service_id" varchar NOT NULL,
	"service_name" text NOT NULL,
	"service_type" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"total" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"number" text NOT NULL,
	"customer_id" varchar,
	"customer_name" text NOT NULL,
	"customer_phone" text NOT NULL,
	"customer_email" text,
	"date" timestamp DEFAULT now(),
	"delivery_date" timestamp,
	"subtotal" numeric(10, 2) NOT NULL,
	"tax" numeric(10, 2) NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"payment_method" text,
	"payment_reference" text,
	"status" text DEFAULT 'received',
	"employee_id" varchar,
	"paid" boolean DEFAULT false,
	"delivered" boolean DEFAULT false,
	"cancelled_at" timestamp,
	"cancellation_reason" text,
	CONSTRAINT "invoices_number_unique" UNIQUE("number")
);
--> statement-breakpoint
CREATE TABLE "message_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"active" boolean DEFAULT true,
	"auto_send" boolean DEFAULT false,
	"send_time" text,
	"reminder_days" integer,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"subdomain" text,
	"email" text,
	"phone" text,
	"address" text,
	"city" text,
	"country" text DEFAULT 'Dominican Republic',
	"logo" text,
	"plan_id" varchar,
	"subscription_status" text DEFAULT 'active',
	"subscription_start_date" timestamp DEFAULT now(),
	"subscription_end_date" timestamp,
	"trial_start_date" timestamp,
	"trial_end_date" timestamp,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"is_trial_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "organizations_subdomain_unique" UNIQUE("subdomain")
);
--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"icon" text NOT NULL,
	"active" boolean DEFAULT true,
	"requires_reference" boolean DEFAULT false,
	"commission" numeric(5, 2) DEFAULT '0',
	"description" text,
	"show_on_invoice" boolean DEFAULT true,
	"color" text DEFAULT '#3B82F6',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "payment_methods_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" text DEFAULT 'Ropa Básica' NOT NULL,
	"wash_price" numeric(10, 2) NOT NULL,
	"iron_price" numeric(10, 2) NOT NULL,
	"both_price" numeric(10, 2) NOT NULL,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscription_plans" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"display_name" text NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"billing_period" text NOT NULL,
	"features" text[],
	"max_organizations" integer DEFAULT 1,
	"max_users" integer DEFAULT 1,
	"max_invoices_per_month" integer,
	"support_level" text DEFAULT 'basic',
	"active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "user_sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"password" text NOT NULL,
	"organization_id" varchar,
	"role" text DEFAULT 'owner',
	"is_active" boolean DEFAULT true,
	"is_email_verified" boolean DEFAULT false,
	"email_verification_token" text,
	"password_reset_token" text,
	"password_reset_expires" timestamp,
	"last_login_at" timestamp,
	"avatar" text,
	"preferences" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_plan_id_subscription_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;