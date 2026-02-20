import { notFound } from 'next/navigation';
import { db, events, ticketTypes } from '@/src/db';
import { eq } from 'drizzle-orm';
import { TicketPurchase } from './ticket-purchase';
import { Countdown } from './countdown';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ eventId: string }>;
}

// Generate dynamic metadata for OG/Twitter cards
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { eventId } = await params;
  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1);
  
  if (!event) {
    return {
      title: 'Event Not Found',
    };
  }
  
  const eventDate = new Date(event.startsAt);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  
  const tickets = await db
    .select()
    .from(ticketTypes)
    .where(eq(ticketTypes.eventId, eventId));
  
  const lowestPrice = tickets.length > 0
    ? Math.min(...tickets.map(t => t.price))
    : null;
  
  const priceText = lowestPrice !== null
    ? lowestPrice === 0 
      ? 'Free' 
      : `From $${(lowestPrice / 100).toFixed(0)}`
    : '';
  
  const description = event.description
    ? event.description.slice(0, 200) + (event.description.length > 200 ? '...' : '')
    : `Join us for ${event.title} on ${formattedDate}`;
  
  const baseUrl = process.env.NEXT_PUBLIC_EVENTS_URL || 'https://events.imajin.ai';
  const url = `${baseUrl}/${event.id}`;
  
  // Use event image or generate a placeholder description
  const ogImage = event.imageUrl || `${baseUrl}/api/og?title=${encodeURIComponent(event.title)}&date=${encodeURIComponent(formattedDate)}&location=${encodeURIComponent(event.city || 'Virtual')}`;
  
  return {
    title: `${event.title} | Imajin Events`,
    description,
    openGraph: {
      title: event.title,
      description,
      url,
      siteName: 'Imajin Events',
      type: 'website',
      images: event.imageUrl ? [{ url: event.imageUrl, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description,
      images: event.imageUrl ? [event.imageUrl] : undefined,
    },
    other: {
      'event:date': eventDate.toISOString(),
      'event:location': event.city || 'Virtual',
      ...(priceText && { 'event:price': priceText }),
    },
  };
}

interface EventMetadata {
  featured?: boolean;
  theme?: {
    color?: string;
    emoji?: string;
    gradient?: [string, string];
  };
  virtualPlatform?: string;
  physicalThreshold?: number;
  [key: string]: unknown;
}

const colorGradients: Record<string, [string, string]> = {
  orange: ['from-orange-500', 'to-amber-600'],
  blue: ['from-blue-500', 'to-indigo-600'],
  green: ['from-green-500', 'to-emerald-600'],
  purple: ['from-purple-500', 'to-pink-600'],
  red: ['from-red-500', 'to-rose-600'],
};

async function getEvent(eventId: string) {
  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1);
  return event;
}

async function getTicketTypes(eventId: string) {
  return db
    .select()
    .from(ticketTypes)
    .where(eq(ticketTypes.eventId, eventId));
}

export default async function EventPage({ params }: Props) {
  const { eventId } = await params;
  const event = await getEvent(eventId);
  
  if (!event) {
    notFound();
  }
  
  const tickets = await getTicketTypes(event.id);
  const metadata = (event.metadata || {}) as EventMetadata;
  const theme = metadata.theme || {};
  const themeColor = theme.color || 'orange';
  const themeEmoji = theme.emoji || '🎉';
  const gradient = theme.gradient || colorGradients[themeColor] || colorGradients.orange;
  
  const eventDate = new Date(event.startsAt);
  const isUpcoming = eventDate > new Date();
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero */}
      <div className="relative mb-8">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-64 object-cover rounded-2xl"
          />
        ) : (
          <div className={`w-full h-64 bg-gradient-to-br ${gradient[0]} ${gradient[1]} rounded-2xl flex items-center justify-center`}>
            <span className="text-8xl">{themeEmoji}</span>
          </div>
        )}
        
        {/* Featured badge */}
        {metadata.featured && (
          <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90 px-3 py-1 rounded-full text-sm font-semibold">
            ⭐ Featured
          </div>
        )}
      </div>
      
      {/* Countdown (if upcoming) */}
      {isUpcoming && (
        <Countdown targetDate={event.startsAt.toISOString()} />
      )}
      
      {/* Event Info */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
        
        <div className="flex flex-wrap gap-4 text-gray-600 dark:text-gray-400 mb-6">
          <div className="flex items-center gap-2">
            <span>📅</span>
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🕐</span>
            <span>{formattedTime}</span>
          </div>
          {event.isVirtual && (
            <div className="flex items-center gap-2">
              <span>💻</span>
              <span>Virtual Event</span>
            </div>
          )}
          {event.venue && (
            <div className="flex items-center gap-2">
              <span>📍</span>
              <span>{event.venue}{event.city ? `, ${event.city}` : ''}</span>
            </div>
          )}
        </div>
        
        {event.description && (
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg whitespace-pre-wrap">{event.description}</p>
          </div>
        )}
      </div>
      
      {/* Tickets */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Tickets</h2>
        
        {tickets.length === 0 ? (
          <p className="text-gray-500">No tickets available yet.</p>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <TicketPurchase
                key={ticket.id}
                eventId={event.id}
                eventTitle={event.title}
                ticket={ticket}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
