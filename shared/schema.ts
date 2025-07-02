import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  businessName: text("business_name").notNull(),
  contactName: text("contact_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  status: text("status").notNull().default("prospect"), // prospect, active, past_due, canceled
  clientType: text("client_type"), // crm, crm_ads, website_only, full_service
  tags: text("tags").array(),
  webSlug: text("web_slug"),
  notes: text("notes"),
  preferredCommunication: text("preferred_communication").default("email"),
  currentPayment: text("current_payment"), // Monthly payment amount from CSV
  proposedPayment: text("proposed_payment"), // Proposed payment amount
  upsellAmount: text("upsell_amount"), // Upsell opportunity amount
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const boostClients = pgTable("boost_clients", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id),
  kickoffCallCompleted: boolean("kickoff_call_completed").default(false),
  kickoffCallDate: timestamp("kickoff_call_date"),
  landingPagesLive: boolean("landing_pages_live").default(false),
  landingPagesDate: timestamp("landing_pages_date"),
  metaAdsLive: boolean("meta_ads_live").default(false),
  metaAdsDate: timestamp("meta_ads_date"),
  googleAdsLive: boolean("google_ads_live").default(false),
  googleAdsDate: timestamp("google_ads_date"),
  websiteLive: boolean("website_live").default(false),
  websiteDate: timestamp("website_date"),
  progressPercentage: integer("progress_percentage").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const revenue = pgTable("revenue", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id),
  packageType: text("package_type").notNull(), // crm, crm_ads, website_only, full_service
  startDate: timestamp("start_date").notNull(),
  monthlyRecurringRevenue: decimal("monthly_recurring_revenue", { precision: 10, scale: 2 }),
  oneTimeCharges: decimal("one_time_charges", { precision: 10, scale: 2 }).default("0"),
  totalPaid: decimal("total_paid", { precision: 10, scale: 2 }).default("0"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id),
  invoiceNumber: text("invoice_number").notNull().unique(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, paid, overdue, canceled
  frequency: text("frequency").default("one_time"), // one_time, monthly
  dueDate: timestamp("due_date").notNull(),
  paidDate: timestamp("paid_date"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeInvoiceId: text("stripe_invoice_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const onboardingForms = pgTable("onboarding_forms", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id),
  businessName: text("business_name"),
  contactName: text("contact_name"),
  phone: text("phone"),
  email: text("email"),
  clientType: text("client_type"),
  preferredCommunication: text("preferred_communication"),
  webSlug: text("web_slug"),
  goals: text("goals"),
  monthlyAdBudget: decimal("monthly_ad_budget", { precision: 10, scale: 2 }),
  promotions: text("promotions"),
  assetFileNames: text("asset_file_names"),
  landingPageChoice: text("landing_page_choice"),
  customizations: text("customizations"),
  adChannels: text("ad_channels").array(),
  fullWebsite: boolean("full_website"),
  additionalContacts: jsonb("additional_contacts"),
  completionProgress: integer("completion_progress").default(0),
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  role: text("role"),
  isPrimary: boolean("is_primary").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const clientsRelations = relations(clients, ({ many, one }) => ({
  boostClient: one(boostClients, {
    fields: [clients.id],
    references: [boostClients.clientId],
  }),
  revenue: many(revenue),
  invoices: many(invoices),
  onboardingForm: one(onboardingForms, {
    fields: [clients.id],
    references: [onboardingForms.clientId],
  }),
  contacts: many(contacts),
}));

export const boostClientsRelations = relations(boostClients, ({ one }) => ({
  client: one(clients, {
    fields: [boostClients.clientId],
    references: [clients.id],
  }),
}));

export const revenueRelations = relations(revenue, ({ one }) => ({
  client: one(clients, {
    fields: [revenue.clientId],
    references: [clients.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  client: one(clients, {
    fields: [invoices.clientId],
    references: [clients.id],
  }),
}));

export const onboardingFormsRelations = relations(onboardingForms, ({ one }) => ({
  client: one(clients, {
    fields: [onboardingForms.clientId],
    references: [clients.id],
  }),
}));

export const contactsRelations = relations(contacts, ({ one }) => ({
  client: one(clients, {
    fields: [contacts.clientId],
    references: [clients.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBoostClientSchema = createInsertSchema(boostClients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRevenueSchema = createInsertSchema(revenue).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOnboardingFormSchema = createInsertSchema(onboardingForms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

export type InsertBoostClient = z.infer<typeof insertBoostClientSchema>;
export type BoostClient = typeof boostClients.$inferSelect;

export type InsertRevenue = z.infer<typeof insertRevenueSchema>;
export type Revenue = typeof revenue.$inferSelect;

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

export type InsertOnboardingForm = z.infer<typeof insertOnboardingFormSchema>;
export type OnboardingForm = typeof onboardingForms.$inferSelect;

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;
