import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertClientSchema, insertBoostClientSchema, insertRevenueSchema, insertInvoiceSchema, insertOnboardingFormSchema, insertContactSchema } from "@shared/schema";
import { z } from "zod";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard metrics
  app.get("/api/dashboard/metrics", async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching dashboard metrics: " + error.message });
    }
  });

  // Client routes
  app.get("/api/clients", async (req, res) => {
    try {
      const { status } = req.query;
      let clients;

      if (status && typeof status === "string") {
        clients = await storage.getClientsByStatus(status);
      } else {
        clients = await storage.getClients();
      }

      res.json(clients);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching clients: " + error.message });
    }
  });

  app.get("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const client = await storage.getClient(id);

      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      res.json(client);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching client: " + error.message });
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      const validatedData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(validatedData);
      res.status(201).json(client);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating client: " + error.message });
    }
  });

  app.put("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(id, validatedData);
      res.json(client);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating client: " + error.message });
    }
  });

  // Update client status
  app.put("/api/clients/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;

      if (!status || typeof status !== 'string') {
        return res.status(400).json({ message: "Status is required and must be a string" });
      }

      const validatedData = { status: status };
      const client = await storage.updateClient(id, validatedData);

      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      res.json(client);
    } catch (error: any) {
      res.status(500).json({ message: "Error updating client status: " + error.message });
    }
  });

  app.delete("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteClient(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Error deleting client: " + error.message });
    }
  });

  // Boost client routes
  app.get("/api/boost-clients", async (req, res) => {
    try {
      const boostClients = await storage.getBoostClients();
      res.json(boostClients);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching boost clients: " + error.message });
    }
  });

  app.get("/api/boost-clients/:clientId", async (req, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      const boostClient = await storage.getBoostClient(clientId);

      if (!boostClient) {
        return res.status(404).json({ message: "Boost client not found" });
      }

      res.json(boostClient);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching boost client: " + error.message });
    }
  });

  app.post("/api/boost-clients", async (req, res) => {
    try {
      const validatedData = insertBoostClientSchema.parse(req.body);
      const boostClient = await storage.createBoostClient(validatedData);
      res.status(201).json(boostClient);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating boost client: " + error.message });
    }
  });

  app.put("/api/boost-clients/:clientId", async (req, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      const validatedData = insertBoostClientSchema.partial().parse(req.body);
      const boostClient = await storage.updateBoostClient(clientId, validatedData);
      res.json(boostClient);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating boost client: " + error.message });
    }
  });

  // Revenue routes
  app.get("/api/revenue", async (req, res) => {
    try {
      const revenue = await storage.getRevenue();
      res.json(revenue);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching revenue: " + error.message });
    }
  });

  app.get("/api/revenue/metrics", async (req, res) => {
    try {
      const metrics = await storage.getRevenueMetrics();
      res.json(metrics);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching revenue metrics: " + error.message });
    }
  });

  app.get("/api/revenue/client/:clientId", async (req, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      const revenue = await storage.getRevenueByClient(clientId);
      res.json(revenue);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching client revenue: " + error.message });
    }
  });

  app.post("/api/revenue", async (req, res) => {
    try {
      const validatedData = insertRevenueSchema.parse(req.body);
      const revenue = await storage.createRevenue(validatedData);
      res.status(201).json(revenue);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating revenue: " + error.message });
    }
  });

  app.put("/api/revenue/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertRevenueSchema.partial().parse(req.body);
      const revenue = await storage.updateRevenue(id, validatedData);
      res.json(revenue);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating revenue: " + error.message });
    }
  });

  // Invoice routes
  app.get("/api/invoices", async (req, res) => {
    try {
      const { status } = req.query;
      let invoices;

      if (status && typeof status === "string") {
        invoices = await storage.getInvoicesByStatus(status);
      } else {
        invoices = await storage.getInvoices();
      }

      res.json(invoices);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching invoices: " + error.message });
    }
  });

  app.get("/api/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const invoice = await storage.getInvoice(id);

      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      res.json(invoice);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching invoice: " + error.message });
    }
  });

  app.post("/api/invoices", async (req, res) => {
    try {
      const validatedData = insertInvoiceSchema.parse(req.body);

      // Generate invoice number
      const invoiceCount = (await storage.getInvoices()).length;
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(3, '0')}`;

      // Get client details for Stripe
      const client = await storage.getClient(validatedData.clientId);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      // Create or get Stripe customer
      let stripeCustomer;
      try {
        const customers = await stripe.customers.list({
          email: client.email,
          limit: 1,
        });

        if (customers.data.length > 0) {
          stripeCustomer = customers.data[0];
        } else {
          stripeCustomer = await stripe.customers.create({
            name: client.businessName,
            email: client.email,
            metadata: {
              bowlnow_client_id: client.id.toString(),
            },
          });
        }
      } catch (stripeError: any) {
        console.warn("Stripe customer creation failed:", stripeError.message);
        // Continue without Stripe if it fails
      }

      let stripeInvoiceId = null;

      // Create Stripe invoice if customer was created successfully
      if (stripeCustomer) {
        try {
          const stripeInvoice = await stripe.invoices.create({
            customer: stripeCustomer.id,
            description: validatedData.description || `Invoice ${invoiceNumber}`,
            metadata: {
              bowlnow_invoice_number: invoiceNumber,
              bowlnow_client_id: client.id.toString(),
            },
          });

          // Add line item to Stripe invoice
          await stripe.invoiceItems.create({
            customer: stripeCustomer.id,
            invoice: stripeInvoice.id,
            amount: Math.round(Number(validatedData.amount) * 100), // Convert to cents
            currency: 'usd',
            description: validatedData.description || `Service - ${client.businessName}`,
          });

          // Finalize the invoice
          if (stripeInvoice.id) {
            await stripe.invoices.finalizeInvoice(stripeInvoice.id);
          }

          stripeInvoiceId = stripeInvoice.id;
        } catch (stripeError: any) {
          console.warn("Stripe invoice creation failed:", stripeError.message);
          // Continue without Stripe if it fails
        }
      }

      // Create local invoice
      const invoice = await storage.createInvoice({
        ...validatedData,
        invoiceNumber,
        stripeInvoiceId,
      });

      res.status(201).json(invoice);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating invoice: " + error.message });
    }
  });

  app.put("/api/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertInvoiceSchema.partial().parse(req.body);
      const invoice = await storage.updateInvoice(id, validatedData);
      res.json(invoice);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating invoice: " + error.message });
    }
  });

  // Onboarding routes
  app.get("/api/onboarding", async (req, res) => {
    try {
      const forms = await storage.getOnboardingForms();
      res.json(forms);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching onboarding forms: " + error.message });
    }
  });

  app.get("/api/onboarding/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const form = await storage.getOnboardingForm(id);

      if (!form) {
        return res.status(404).json({ message: "Onboarding form not found" });
      }

      res.json(form);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching onboarding form: " + error.message });
    }
  });

  app.post("/api/onboarding", async (req, res) => {
    try {
      const validatedData = insertOnboardingFormSchema.parse(req.body);
      const form = await storage.createOnboardingForm(validatedData);
      res.status(201).json(form);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating onboarding form: " + error.message });
    }
  });

  app.put("/api/onboarding/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertOnboardingFormSchema.partial().parse(req.body);
      const form = await storage.updateOnboardingForm(id, validatedData);
      res.json(form);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating onboarding form: " + error.message });
    }
  });

  // Contact routes
  app.get("/api/contacts/:clientId", async (req, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      const contacts = await storage.getContacts(clientId);
      res.json(contacts);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching contacts: " + error.message });
    }
  });

  app.post("/api/contacts", async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validatedData);
      res.status(201).json(contact);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating contact: " + error.message });
    }
  });

  app.put("/api/contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertContactSchema.partial().parse(req.body);
      const contact = await storage.updateContact(id, validatedData);
      res.json(contact);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating contact: " + error.message });
    }
  });

  app.delete("/api/contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteContact(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Error deleting contact: " + error.message });
    }
  });

  // CSV Export endpoints
  app.get("/api/export/revenue", async (req, res) => {
    try {
      const revenue = await storage.getRevenue();

      // Convert to CSV format
      const headers = ["Client", "Package Type", "Start Date", "MRR", "One-Time", "Total Paid"];
      const csvRows = [
        headers.join(","),
        ...revenue.map(r => [
          `"${r.client.businessName}"`,
          r.packageType,
          r.startDate.toISOString().split('T')[0],
          r.monthlyRecurringRevenue || "0",
          r.oneTimeCharges || "0",
          r.totalPaid || "0"
        ].join(","))
      ];

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="revenue-report.csv"');
      res.send(csvRows.join("\n"));
    } catch (error: any) {
      res.status(500).json({ message: "Error exporting revenue: " + error.message });
    }
  });

  app.get("/api/export/clients", async (req, res) => {
    try {
      const clients = await storage.getClients();

      // Convert to CSV format
      const headers = ["Business Name", "Contact", "Email", "Phone", "Status", "Client Type"];
      const csvRows = [
        headers.join(","),
        ...clients.map(c => [
          `"${c.businessName}"`,
          `"${c.contactName}"`,
          c.email,
          c.phone || "",
          c.status,
          c.clientType || ""
        ].join(","))
      ];

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="clients-report.csv"');
      res.send(csvRows.join("\n"));
    } catch (error: any) {
      res.status(500).json({ message: "Error exporting clients: " + error.message });
    }
  });

  // Stripe webhook for invoice payment status updates
  app.post("/api/stripe/webhook", async (req, res) => {
    try {
      const event = req.body;

      switch (event.type) {
        case 'invoice.payment_succeeded':
          const paidInvoice = event.data.object;
          const invoiceNumber = paidInvoice.metadata?.bowlnow_invoice_number;

          if (invoiceNumber) {
            // Find and update the local invoice
            const invoices = await storage.getInvoices();
            const localInvoice = invoices.find(inv => inv.invoiceNumber === invoiceNumber);

            if (localInvoice) {
              await storage.updateInvoice(localInvoice.id, {
                status: 'paid',
                paidDate: new Date(),
              });
              console.log(`Invoice ${invoiceNumber} marked as paid via Stripe webhook`);
            }
          }
          break;

        case 'invoice.payment_failed':
          const failedInvoice = event.data.object;
          const failedInvoiceNumber = failedInvoice.metadata?.bowlnow_invoice_number;

          if (failedInvoiceNumber) {
            const invoices = await storage.getInvoices();
            const localInvoice = invoices.find(inv => inv.invoiceNumber === failedInvoiceNumber);

            if (localInvoice) {
              await storage.updateInvoice(localInvoice.id, {
                status: 'overdue',
              });
              console.log(`Invoice ${failedInvoiceNumber} marked as overdue via Stripe webhook`);
            }
          }
          break;
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error('Stripe webhook error:', error);
      res.status(400).json({ error: 'Webhook handling failed' });
    }
  });

  // Sync invoices from Stripe to BowlNow
  app.post("/api/stripe/sync-invoices", async (req, res) => {
    try {
      const stripeInvoices = await stripe.invoices.list({ limit: 100 });
      let syncedCount = 0;
      let importedCount = 0;

      const existingInvoices = await storage.getInvoices();

      for (const stripeInvoice of stripeInvoices.data) {
        const bowlnowInvoiceNumber = stripeInvoice.metadata?.bowlnow_invoice_number;

        if (bowlnowInvoiceNumber) {
          // This invoice was created from BowlNow, just sync status
          const existingInvoice = existingInvoices.find(inv => inv.invoiceNumber === bowlnowInvoiceNumber);

          if (existingInvoice) {
            const stripeStatus = stripeInvoice.status === 'paid' ? 'paid' : 
                               stripeInvoice.status === 'open' ? 'pending' : 'overdue';

            if (existingInvoice.status !== stripeStatus) {
              await storage.updateInvoice(existingInvoice.id, {
                status: stripeStatus,
                paidDate: stripeInvoice.status === 'paid' && stripeInvoice.status_transitions.paid_at ? 
                         new Date(stripeInvoice.status_transitions.paid_at * 1000) : null,
              });
              syncedCount++;
            }
          }
        } else {
          // This is a Stripe-only invoice, import it to BowlNow
          const alreadyImported = existingInvoices.find(inv => inv.stripeInvoiceId === stripeInvoice.id);

          if (!alreadyImported && stripeInvoice.customer) {
            try {
              // Get customer details from Stripe
              const customer = await stripe.customers.retrieve(stripeInvoice.customer as string);

              if (customer && !customer.deleted) {
                // Try to find matching client by email
                const clients = await storage.getClients();
                const matchingClient = clients.find(c => c.email === customer.email);

                if (matchingClient) {
                  // Generate invoice number for imported invoice
                  const invoiceCount = existingInvoices.length + importedCount;
                  const invoiceNumber = `STRIPE-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(3, '0')}`;

                  const stripeStatus = stripeInvoice.status === 'paid' ? 'paid' : 
                                     stripeInvoice.status === 'open' ? 'pending' : 'overdue';

                  await storage.createInvoice({
                    clientId: matchingClient.id,
                    invoiceNumber,
                    description: stripeInvoice.description || `Imported from Stripe - ${stripeInvoice.id}`,
                    amount: stripeInvoice.amount_due / 100, // Convert from cents
                    status: stripeStatus,
                    frequency: 'one_time',
                    dueDate: new Date(stripeInvoice.due_date ? stripeInvoice.due_date * 1000 : Date.now()),
                    paidDate: stripeInvoice.status === 'paid' && stripeInvoice.status_transitions.paid_at ? 
                             new Date(stripeInvoice.status_transitions.paid_at * 1000) : null,
                    stripeInvoiceId: stripeInvoice.id,
                  });

                  importedCount++;
                }
              }
            } catch (customerError) {
              console.warn(`Failed to import Stripe invoice ${stripeInvoice.id}:`, customerError);
            }
          }
        }
      }

      res.json({ 
        message: `Synced ${syncedCount} existing invoices and imported ${importedCount} new invoices from Stripe`,
        synced: syncedCount,
        imported: importedCount
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error syncing Stripe invoices: " + error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}