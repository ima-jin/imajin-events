import Link from 'next/link';
import { db, events } from '@/src/db';
import { desc, eq } from 'drizzle-orm';

async function getUpcomingEvents() {
  try {
    return await db
      .select()
      .from(events)
      .where(eq(events.status, 'published'))
      .orderBy(desc(events.startsAt))
      .limit(20);
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const eventList = await getUpcomingEvents();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover events on the sovereign network
          </p>
        </div>
        <Link
          href="/create"
          className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold"
        >
          Create Event
        </Link>
      </div>

      {eventList.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-xl font-semibold mb-2">No events yet</h2>
          <p className="text-gray-500 mb-6">Be the first to create an event!</p>
          <Link
            href="/create"
            className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
          >
            Create Event
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {eventList.map((event) => (
            <Link
              key={event.id}
              href={`/${event.id}`}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition"
            >
              <div className="flex gap-6">
                {event.imageUrl && (
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-2">{event.title}</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {event.description}
                  </p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>
                      📅 {new Date(event.startsAt).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    {event.city && <span>📍 {event.city}</span>}
                    {event.isVirtual && <span>💻 Virtual</span>}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
