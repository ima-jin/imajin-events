import { pgTable, text, timestamp, jsonb, integer, boolean, index } from 'drizzle-orm/pg-core';

/**
 * Events - happenings on the network
 */
export const events = pgTable('events', {
  id: text('id').primaryKey(),                              // evt_xxx
  did: text('did').notNull().unique(),                      // did:imajin:xxx (event's own DID)
  creatorDid: text('creator_did').notNull(),                // DID of creator
  title: text('title').notNull(),
  description: text('description'),
  
  // Timing
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  endsAt: timestamp('ends_at', { withTimezone: true }),
  
  // Location
  isVirtual: boolean('is_virtual').default(false),
  virtualUrl: text('virtual_url'),
  venue: text('venue'),
  address: text('address'),
  city: text('city'),
  country: text('country'),
  
  // Status
  status: text('status').notNull().default('draft'),        // draft, published, cancelled, completed
  
  // Media
  imageUrl: text('image_url'),
  
  // Metadata
  tags: jsonb('tags').default([]),
  metadata: jsonb('metadata').default({}),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  creatorIdx: index('idx_events_creator').on(table.creatorDid),
  statusIdx: index('idx_events_status').on(table.status),
  startsIdx: index('idx_events_starts').on(table.startsAt),
}));

/**
 * Ticket Types - different tiers for an event
 */
export const ticketTypes = pgTable('ticket_types', {
  id: text('id').primaryKey(),                              // tkt_type_xxx
  eventId: text('event_id').references(() => events.id).notNull(),
  name: text('name').notNull(),                             // "Virtual", "Physical", "VIP"
  description: text('description'),
  price: integer('price').notNull(),                        // in cents
  currency: text('currency').notNull().default('USD'),
  quantity: integer('quantity'),                            // null = unlimited
  sold: integer('sold').default(0),
  
  // Perks/metadata
  perks: jsonb('perks').default([]),
  metadata: jsonb('metadata').default({}),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  eventIdx: index('idx_ticket_types_event').on(table.eventId),
}));

/**
 * Tickets - purchased tickets owned by DIDs
 */
export const tickets = pgTable('tickets', {
  id: text('id').primaryKey(),                              // tkt_xxx
  eventId: text('event_id').references(() => events.id).notNull(),
  ticketTypeId: text('ticket_type_id').references(() => ticketTypes.id).notNull(),
  ownerDid: text('owner_did').notNull(),                    // Current owner
  originalOwnerDid: text('original_owner_did').notNull(),   // First purchaser
  
  // Purchase info
  purchasedAt: timestamp('purchased_at', { withTimezone: true }).defaultNow(),
  pricePaid: integer('price_paid').notNull(),
  currency: text('currency').notNull(),
  paymentId: text('payment_id'),                            // Reference to pay service
  
  // Status
  status: text('status').notNull().default('valid'),        // valid, used, cancelled, transferred
  usedAt: timestamp('used_at', { withTimezone: true }),
  
  // Signature (event signs ticket issuance)
  signature: text('signature').notNull(),
  
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  eventIdx: index('idx_tickets_event').on(table.eventId),
  ownerIdx: index('idx_tickets_owner').on(table.ownerDid),
  statusIdx: index('idx_tickets_status').on(table.status),
}));

// Types
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type TicketType = typeof ticketTypes.$inferSelect;
export type Ticket = typeof tickets.$inferSelect;
