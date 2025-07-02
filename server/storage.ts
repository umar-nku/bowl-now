import { 
  clients, 
  boostClients, 
  revenue, 
  invoices, 
  onboardingForms, 
  contacts,
  users,
  type Client, 
  type BoostClient, 
  type Revenue, 
  type Invoice, 
  type OnboardingForm, 
  type Contact,
  type User,
  type InsertClient, 
  type InsertBoostClient, 
  type InsertRevenue, 
  type InsertInvoice, 
  type InsertOnboardingForm, 
  type InsertContact,
  type InsertUser
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStripeInfo(id: number, customerId: string, subscriptionId: string): Promise<User>;

  // Client methods
  getClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client>;
  deleteClient(id: number): Promise<void>;
  getClientsByStatus(status: string): Promise<Client[]>;

  // Boost client methods
  getBoostClients(): Promise<(BoostClient & { client: Client })[]>;
  getBoostClient(clientId: number): Promise<BoostClient | undefined>;
  createBoostClient(boostClient: InsertBoostClient): Promise<BoostClient>;
  updateBoostClient(clientId: number, boostClient: Partial<InsertBoostClient>): Promise<BoostClient>;

  // Revenue methods
  getRevenue(): Promise<(Revenue & { client: Client })[]>;
  getRevenueByClient(clientId: number): Promise<Revenue[]>;
  createRevenue(revenue: InsertRevenue): Promise<Revenue>;
  updateRevenue(id: number, revenue: Partial<InsertRevenue>): Promise<Revenue>;
  getRevenueMetrics(): Promise<{
    totalMRR: number;
    totalOneTime: number;
    totalRevenue: number;
  }>;

  // Invoice methods
  getInvoices(): Promise<(Invoice & { client: Client })[]>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice>;
  getInvoicesByStatus(status: string): Promise<(Invoice & { client: Client })[]>;

  // Onboarding methods
  getOnboardingForms(): Promise<(OnboardingForm & { client?: Client })[]>;
  getOnboardingForm(id: number): Promise<OnboardingForm | undefined>;
  createOnboardingForm(form: InsertOnboardingForm): Promise<OnboardingForm>;
  updateOnboardingForm(id: number, form: Partial<InsertOnboardingForm>): Promise<OnboardingForm>;

  // Contact methods
  getContacts(clientId: number): Promise<Contact[]>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: number, contact: Partial<InsertContact>): Promise<Contact>;
  deleteContact(id: number): Promise<void>;

  // Dashboard metrics
  getDashboardMetrics(): Promise<{
    totalClients: number;
    activeClients: number;
    prospects: number;
    overdue: number;
    totalMRR: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserStripeInfo(id: number, customerId: string, subscriptionId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ stripeCustomerId: customerId, stripeSubscriptionId: subscriptionId })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getClients(): Promise<Client[]> {
    return await db.select().from(clients).orderBy(desc(clients.createdAt));
  }

  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [newClient] = await db
      .insert(clients)
      .values({ ...client, updatedAt: new Date() })
      .returning();
    return newClient;
  }

  async updateClient(id: number, client: Partial<InsertClient>): Promise<Client> {
    const [updatedClient] = await db
      .update(clients)
      .set({ ...client, updatedAt: new Date() })
      .where(eq(clients.id, id))
      .returning();
    return updatedClient;
  }

  async deleteClient(id: number): Promise<void> {
    await db.delete(clients).where(eq(clients.id, id));
  }

  async getClientsByStatus(status: string): Promise<Client[]> {
    return await db.select().from(clients).where(eq(clients.status, status));
  }

  async getBoostClients(): Promise<(BoostClient & { client: Client })[]> {
    return await db
      .select()
      .from(boostClients)
      .innerJoin(clients, eq(boostClients.clientId, clients.id))
      .orderBy(desc(boostClients.createdAt));
  }

  async getBoostClient(clientId: number): Promise<BoostClient | undefined> {
    const [boostClient] = await db
      .select()
      .from(boostClients)
      .where(eq(boostClients.clientId, clientId));
    return boostClient || undefined;
  }

  async createBoostClient(boostClient: InsertBoostClient): Promise<BoostClient> {
    const [newBoostClient] = await db
      .insert(boostClients)
      .values({ ...boostClient, updatedAt: new Date() })
      .returning();
    return newBoostClient;
  }

  async updateBoostClient(clientId: number, boostClient: Partial<InsertBoostClient>): Promise<BoostClient> {
    const [updatedBoostClient] = await db
      .update(boostClients)
      .set({ ...boostClient, updatedAt: new Date() })
      .where(eq(boostClients.clientId, clientId))
      .returning();
    return updatedBoostClient;
  }

  async getRevenue(): Promise<(Revenue & { client: Client })[]> {
    return await db
      .select()
      .from(revenue)
      .innerJoin(clients, eq(revenue.clientId, clients.id))
      .orderBy(desc(revenue.createdAt));
  }

  async getRevenueByClient(clientId: number): Promise<Revenue[]> {
    return await db.select().from(revenue).where(eq(revenue.clientId, clientId));
  }

  async createRevenue(revenueData: InsertRevenue): Promise<Revenue> {
    const [newRevenue] = await db
      .insert(revenue)
      .values({ ...revenueData, updatedAt: new Date() })
      .returning();
    return newRevenue;
  }

  async updateRevenue(id: number, revenueData: Partial<InsertRevenue>): Promise<Revenue> {
    const [updatedRevenue] = await db
      .update(revenue)
      .set({ ...revenueData, updatedAt: new Date() })
      .where(eq(revenue.id, id))
      .returning();
    return updatedRevenue;
  }

  async getRevenueMetrics(): Promise<{
    totalMRR: number;
    totalOneTime: number;
    totalRevenue: number;
  }> {
    const result = await db
      .select({
        totalMRR: sql<number>`COALESCE(SUM(CASE WHEN is_active = true THEN monthly_recurring_revenue ELSE 0 END), 0)`,
        totalOneTime: sql<number>`COALESCE(SUM(one_time_charges), 0)`,
        totalRevenue: sql<number>`COALESCE(SUM(total_paid), 0)`,
      })
      .from(revenue);

    return result[0] || { totalMRR: 0, totalOneTime: 0, totalRevenue: 0 };
  }

  async getInvoices(): Promise<(Invoice & { client: Client })[]> {
    return await db
      .select()
      .from(invoices)
      .innerJoin(clients, eq(invoices.clientId, clients.id))
      .orderBy(desc(invoices.createdAt));
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice || undefined;
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [newInvoice] = await db
      .insert(invoices)
      .values({ ...invoice, updatedAt: new Date() })
      .returning();
    return newInvoice;
  }

  async updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice> {
    const [updatedInvoice] = await db
      .update(invoices)
      .set({ ...invoice, updatedAt: new Date() })
      .where(eq(invoices.id, id))
      .returning();
    return updatedInvoice;
  }

  async getInvoicesByStatus(status: string): Promise<(Invoice & { client: Client })[]> {
    return await db
      .select()
      .from(invoices)
      .innerJoin(clients, eq(invoices.clientId, clients.id))
      .where(eq(invoices.status, status))
      .orderBy(desc(invoices.createdAt));
  }

  async getOnboardingForms(): Promise<(OnboardingForm & { client?: Client })[]> {
    return await db
      .select()
      .from(onboardingForms)
      .leftJoin(clients, eq(onboardingForms.clientId, clients.id))
      .orderBy(desc(onboardingForms.createdAt));
  }

  async getOnboardingForm(id: number): Promise<OnboardingForm | undefined> {
    const [form] = await db.select().from(onboardingForms).where(eq(onboardingForms.id, id));
    return form || undefined;
  }

  async createOnboardingForm(form: InsertOnboardingForm): Promise<OnboardingForm> {
    const [newForm] = await db
      .insert(onboardingForms)
      .values({ ...form, updatedAt: new Date() })
      .returning();
    return newForm;
  }

  async updateOnboardingForm(id: number, form: Partial<InsertOnboardingForm>): Promise<OnboardingForm> {
    const [updatedForm] = await db
      .update(onboardingForms)
      .set({ ...form, updatedAt: new Date() })
      .where(eq(onboardingForms.id, id))
      .returning();
    return updatedForm;
  }

  async getContacts(clientId: number): Promise<Contact[]> {
    return await db.select().from(contacts).where(eq(contacts.clientId, clientId));
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const [newContact] = await db
      .insert(contacts)
      .values(contact)
      .returning();
    return newContact;
  }

  async updateContact(id: number, contact: Partial<InsertContact>): Promise<Contact> {
    const [updatedContact] = await db
      .update(contacts)
      .set(contact)
      .where(eq(contacts.id, id))
      .returning();
    return updatedContact;
  }

  async deleteContact(id: number): Promise<void> {
    await db.delete(contacts).where(eq(contacts.id, id));
  }

  async getDashboardMetrics(): Promise<{
    totalClients: number;
    activeClients: number;
    prospects: number;
    overdue: number;
    totalMRR: number;
  }> {
    const [clientMetrics] = await db
      .select({
        totalClients: sql<number>`COUNT(*)`,
        activeClients: sql<number>`COUNT(CASE WHEN status = 'active' THEN 1 END)`,
        prospects: sql<number>`COUNT(CASE WHEN status = 'prospect' THEN 1 END)`,
        overdue: sql<number>`COUNT(CASE WHEN status = 'past_due' THEN 1 END)`,
      })
      .from(clients);

    const revenueMetrics = await this.getRevenueMetrics();

    return {
      ...clientMetrics,
      totalMRR: revenueMetrics.totalMRR,
    };
  }
}

export const storage = new DatabaseStorage();
