import { db } from './db.ts';
import { clients } from '../shared/schema.ts';
import { eq } from 'drizzle-orm';

// Manual completion of remaining high-value clients from CSV
const remainingClients = [
  { name: "Park Center Lanes", payment: "$99.00" },
  { name: "Snake River Bowl", payment: "$99.00" },
  { name: "Kingpins Alley - Latham", payment: "$548.00" },
  { name: "Kingpins Alley - South Glen Falls", payment: "$548.00" },
  { name: "Richfield BOWL-A-RAMA!", payment: "$249.00" },
  { name: "Crossroads Social House", payment: "$548.00" },
  { name: "Split Happens Bowling Center", payment: "$99.00" },
  { name: "Suburban Bowlerama", payment: "$199.00" },
  { name: "Orange Bowl Lanes", payment: "$99.00" },
  { name: "Eastown Recreation Center", payment: "$99.00" },
  { name: "Great River Bowl", payment: "$1,550.00" },
  { name: "Classic Lanes", payment: "$1,550.00" },
  { name: "Bertrand Lanes", payment: "$1,550.00" },
  { name: "Bellefonte Lanes", payment: "$1,550.00" },
  { name: "Oakwood Bowl", payment: "$1,550.00" },
  { name: "Pineville Bowl", payment: "$387.50" },
  { name: "Our Town Alley", payment: "$1,350.00" },
  { name: "Roseland Lanes", payment: "$1,550.00" },
  { name: "Northern Lights Recreation", payment: "$1,499.00" },
  { name: "Center Lanes", payment: "$99.00" },
  { name: "Lord Calvert Bowl", payment: "$99.00" },
  { name: "Fast Lanes Bowl", payment: "$99.00" },
  { name: "Greenacres Bowl", payment: "$99.00" },
  { name: "Kent Bowl", payment: "$99.00" },
  { name: "Go Time Karting", payment: "$99.00" },
  { name: "Madsen's Bowling & Billiards", payment: "$149.00" },
  { name: "Farmington Lanes", payment: "$548.00" }
];

async function completeImport() {
  console.log('Completing client payment import...');
  
  for (const client of remainingClients) {
    try {
      await db.update(clients)
        .set({
          currentPayment: client.payment,
          status: 'active',
          updatedAt: new Date()
        })
        .where(eq(clients.businessName, client.name));
      
      console.log(`Updated: ${client.name} - ${client.payment}`);
    } catch (error) {
      console.error(`Failed to update ${client.name}:`, error);
    }
  }
  
  // Calculate final MRR
  const result = await db.query.clients.findMany({
    where: (clients, { eq, and, ne }) => and(
      eq(clients.status, 'active'),
      ne(clients.currentPayment, null)
    )
  });
  
  let totalMRR = 0;
  result.forEach(client => {
    if (client.currentPayment && client.currentPayment !== '$0.00') {
      const amount = parseFloat(client.currentPayment.replace(/[^0-9.-]+/g, ''));
      totalMRR += amount;
    }
  });
  
  console.log(`\nFinal MRR: $${totalMRR.toLocaleString()}`);
  console.log(`Paying clients: ${result.length}`);
}

completeImport();