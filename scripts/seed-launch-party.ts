/**
 * Seed Jin's Launch Party - April 1st, 2026
 * 
 * Run: npx tsx scripts/seed-launch-party.ts
 */

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { events, ticketTypes } from '../src/db/schema';

const DATABASE_URL = process.env.DATABASE_URL!;

async function main() {
  const sql = neon(DATABASE_URL);
  const db = drizzle(sql);
  
  console.log('🎉 Seeding Jin\'s Launch Party...\n');
  
  // Generate IDs
  const eventId = 'jins-launch-party';
  const eventDid = `did:imajin:evt_${Date.now().toString(36)}`;
  const creatorDid = 'did:imajin:77d06a6558dcc3bf'; // Jin's DID
  
  // Create event
  const [event] = await db.insert(events).values({
    id: eventId,
    did: eventDid,
    creatorDid,
    title: "Jin's Launch Party",
    description: `The genesis event of the sovereign network.

Join us for the first-ever real transaction on the Imajin platform — a celebration of AI presence, sovereign infrastructure, and the community that's building the exit.

Jin — a presence living in an 8×8×8 LED cube — invites you to witness the birth of something new.

🟠 Virtual attendees join from anywhere
🎫 Physical attendees gather in Toronto (venue TBA if we hit 40+ physical tickets)

This isn't a product launch. It's a proof of concept for a different way of building technology — where you own your identity, your data, and your money.

No subscriptions. No platform lock-in. No surveillance capitalism.

Just a glowing cube, a community, and the first block of something sovereign.`,
    startsAt: new Date('2026-04-01T19:00:00-04:00'), // 7 PM EDT
    endsAt: new Date('2026-04-01T22:00:00-04:00'),   // 10 PM EDT
    isVirtual: true,
    venue: 'TBA',
    city: 'Toronto',
    country: 'Canada',
    status: 'published',
    tags: ['launch', 'jin', 'sovereign', 'genesis'],
    metadata: {
      virtualPlatform: 'TBD',
      physicalThreshold: 40,
    },
  }).returning();
  
  console.log('✓ Created event:', event.title);
  console.log('  DID:', event.did);
  
  // Create ticket types
  const virtualTicket = await db.insert(ticketTypes).values({
    id: 'tkt_virtual_' + Date.now().toString(36),
    eventId: event.id,
    name: 'Virtual',
    description: 'Join online from anywhere in the world',
    price: 100, // $1.00
    currency: 'USD',
    quantity: null, // Unlimited
    perks: [
      'Live stream access',
      'Chat participation',
      'Digital commemorative NFT (optional)',
      'Recording access',
    ],
  }).returning();
  
  console.log('✓ Created virtual ticket: $1.00 (unlimited)');
  
  const physicalTicket = await db.insert(ticketTypes).values({
    id: 'tkt_physical_' + Date.now().toString(36),
    eventId: event.id,
    name: 'Physical',
    description: 'Attend in person in Toronto',
    price: 1000, // $10.00
    currency: 'USD',
    quantity: 500, // Cap at 500
    perks: [
      'Everything in Virtual',
      'In-person attendance',
      'Meet Jin (the cube)',
      'Meet the team',
      'Light refreshments',
      'Exclusive physical commemorative',
    ],
  }).returning();
  
  console.log('✓ Created physical ticket: $10.00 (500 available)');
  
  console.log('\n🎉 Done! Event live at: /jins-launch-party');
  console.log('\nTicket types:');
  console.log(`  Virtual: ${virtualTicket[0].id}`);
  console.log(`  Physical: ${physicalTicket[0].id}`);
}

main().catch(console.error);
