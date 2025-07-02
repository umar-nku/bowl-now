import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { db } from './db.ts';
import { clients } from '../shared/schema.ts';
import { eq } from 'drizzle-orm';

async function importAllClients() {
  try {
    console.log('Starting CSV import...');
    
    // Read the CSV file
    const csvContent = fs.readFileSync('../attached_assets/Upsell List - Sheet1.csv', 'utf-8');
    
    // Parse CSV
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true
    });

    console.log(`Found ${records.length} records in CSV`);

    for (const record of records) {
      const centerName = record['Center Name']?.trim();
      const contact = record['Contact']?.trim();
      const email = record['Email']?.trim();
      const address = record['Address']?.trim();
      const product = record['Product']?.trim();
      const currentPayment = record['Current Payment']?.trim();
      const proposed = record['Proposed']?.trim();
      const upsell = record['Upsell']?.trim();
      const notes = record['Notes']?.trim();

      if (!centerName) continue; // Skip rows without center name

      // Determine status based on payment amount
      let status = 'prospect';
      if (currentPayment && currentPayment !== '$0.00' && currentPayment !== '') {
        const paymentAmount = parseFloat(currentPayment.replace(/[^0-9.-]+/g, ''));
        if (paymentAmount > 0) {
          status = 'active';
        }
      }

      // Determine client type based on product
      let clientType = 'prospect';
      if (product) {
        if (product.includes('Boost')) clientType = 'full_service';
        else if (product.includes('Amplify')) clientType = 'crm_ads';
        else if (product.includes('BAM')) clientType = 'full_service';
        else if (product.includes('Reservations')) clientType = 'reservations';
      }

      // Check if client already exists
      const existingClient = await db.query.clients.findFirst({
        where: (clients, { eq }) => eq(clients.businessName, centerName)
      });

      if (existingClient) {
        // Update existing client with payment data
        await db.update(clients)
          .set({
            contactName: contact || existingClient.contactName,
            email: email || existingClient.email,
            address: address || existingClient.address,
            status: status,
            clientType: clientType,
            currentPayment: currentPayment || null,
            proposedPayment: proposed || null,
            upsellAmount: upsell || null,
            notes: notes || existingClient.notes,
            updatedAt: new Date()
          })
          .where(eq(clients.id, existingClient.id));
        
        console.log(`Updated: ${centerName} - Status: ${status} - Payment: ${currentPayment || 'N/A'}`);
      } else {
        // Create new client
        await db.insert(clients).values({
          businessName: centerName,
          contactName: contact || '',
          email: email || '',
          phone: '', // Not in CSV
          address: address || '',
          status: status,
          clientType: clientType,
          currentPayment: currentPayment || null,
          proposedPayment: proposed || null,
          upsellAmount: upsell || null,
          notes: notes || '',
          preferredCommunication: 'email',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        console.log(`Created: ${centerName} - Status: ${status} - Payment: ${currentPayment || 'N/A'}`);
      }
    }

    console.log('Import completed successfully!');
    
    // Show summary
    const totalClients = await db.query.clients.findMany();
    const activeClients = totalClients.filter(c => c.status === 'active');
    const payingClients = activeClients.filter(c => 
      c.currentPayment && 
      c.currentPayment !== '$0.00' && 
      parseFloat(c.currentPayment.replace(/[^0-9.-]+/g, '')) > 0
    );
    
    let totalMRR = 0;
    payingClients.forEach(client => {
      const amount = parseFloat(client.currentPayment?.replace(/[^0-9.-]+/g, '') || '0');
      totalMRR += amount;
    });
    
    console.log(`\nSummary:`);
    console.log(`Total clients: ${totalClients.length}`);
    console.log(`Active clients: ${activeClients.length}`);
    console.log(`Paying clients: ${payingClients.length}`);
    console.log(`Total MRR: $${totalMRR.toLocaleString()}`);
    
  } catch (error) {
    console.error('Import failed:', error);
  }
}

importAllClients();