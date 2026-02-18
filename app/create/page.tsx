'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const EVENTS_URL = process.env.NEXT_PUBLIC_EVENTS_URL || 'http://localhost:3007';

interface TicketType {
  name: string;
  description: string;
  price: number;
  quantity: number | null;
}

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Event details
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [isVirtual, setIsVirtual] = useState(false);
  const [virtualUrl, setVirtualUrl] = useState('');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('');

  // Ticket types
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([
    { name: 'General Admission', description: '', price: 0, quantity: null },
  ]);

  function addTicketType() {
    setTicketTypes([...ticketTypes, { name: '', description: '', price: 0, quantity: null }]);
  }

  function updateTicketType(index: number, field: keyof TicketType, value: any) {
    const updated = [...ticketTypes];
    updated[index] = { ...updated[index], [field]: value };
    setTicketTypes(updated);
  }

  function removeTicketType(index: number) {
    setTicketTypes(ticketTypes.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('imajin_token');
      if (!token) {
        throw new Error('Please log in to create an event');
      }

      const res = await fetch(`${EVENTS_URL}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          startsAt,
          endsAt: endsAt || undefined,
          isVirtual,
          virtualUrl: isVirtual ? virtualUrl : undefined,
          venue: !isVirtual ? venue : undefined,
          city,
          tickets: ticketTypes.filter(t => t.name).map(t => ({
            name: t.name,
            description: t.description,
            price: Math.round(t.price * 100), // Convert to cents
            quantity: t.quantity,
          })),
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Store event keypair (creator must secure this!)
      if (data.eventKeypair) {
        const eventKeys = JSON.parse(localStorage.getItem('imajin_event_keys') || '{}');
        eventKeys[data.event.id] = data.eventKeypair;
        localStorage.setItem('imajin_event_keys', JSON.stringify(eventKeys));
      }

      router.push(`/${data.event.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Create Event</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Your event gets its own DID and can sign tickets.
      </p>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Event Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Date & Time *</label>
                <input
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date & Time</label>
                <input
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Location</h2>
          
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isVirtual}
                onChange={(e) => setIsVirtual(e.target.checked)}
                className="rounded"
              />
              <span>This is a virtual event</span>
            </label>

            {isVirtual ? (
              <div>
                <label className="block text-sm font-medium mb-1">Virtual URL</label>
                <input
                  type="url"
                  value={virtualUrl}
                  onChange={(e) => setVirtualUrl(e.target.value)}
                  placeholder="https://zoom.us/..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Venue</label>
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tickets */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Ticket Types</h2>
            <button
              type="button"
              onClick={addTicketType}
              className="text-orange-500 hover:text-orange-600 text-sm font-medium"
            >
              + Add Ticket Type
            </button>
          </div>

          <div className="space-y-4">
            {ticketTypes.map((tt, i) => (
              <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm text-gray-500">Ticket Type {i + 1}</span>
                  {ticketTypes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTicketType(i)}
                      className="text-red-500 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Name</label>
                    <input
                      type="text"
                      value={tt.name}
                      onChange={(e) => updateTicketType(i, 'name', e.target.value)}
                      placeholder="General Admission"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Price (USD)</label>
                    <input
                      type="number"
                      value={tt.price}
                      onChange={(e) => updateTicketType(i, 'price', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Quantity (blank = unlimited)</label>
                    <input
                      type="number"
                      value={tt.quantity || ''}
                      onChange={(e) => updateTicketType(i, 'quantity', e.target.value ? parseInt(e.target.value) : null)}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Description</label>
                    <input
                      type="text"
                      value={tt.description}
                      onChange={(e) => updateTicketType(i, 'description', e.target.value)}
                      placeholder="Includes..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
}
