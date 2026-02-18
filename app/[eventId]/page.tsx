import { notFound } from 'next/navigation';
import { db, events, ticketTypes } from '@/src/db';
import { eq } from 'drizzle-orm';
import { TicketPurchase } from './ticket-purchase';

interface Props {
  params: { eventId: string };
}

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
  const event = await getEvent(params.eventId);
  
  if (!event) {
    notFound();
  }
  
  const tickets = await getTicketTypes(event.id);
  
  const eventDate = new Date(event.startsAt);
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
          <div className="w-full h-64 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center">
            <span className="text-8xl">🎉</span>
          </div>
        )}
      </div>
      
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
