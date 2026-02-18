import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { tickets, ticketTypes } from '../src/db/schema';
import { desc } from 'drizzle-orm';

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);
  
  const allTickets = await db.select().from(tickets).orderBy(desc(tickets.createdAt)).limit(5);
  console.log('Recent tickets:', JSON.stringify(allTickets, null, 2));
  
  const types = await db.select().from(ticketTypes);
  console.log('\nTicket types (sold counts):', types.map(t => ({ name: t.name, sold: t.sold, quantity: t.quantity })));
}

main();
