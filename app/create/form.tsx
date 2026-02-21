'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  organizerDid: string;
}

interface TicketTier {
  name: string;
  price: number;
  quantity: number | null;
  description: string;
}

export default function EventCreateForm({ organizerDid }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Basic info
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [location, setLocation] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  
  // Ticket tiers
  const [tiers, setTiers] = useState<TicketTier[]>([
    { name: 'General Admission', price: 0, quantity: null, description: '' }
  ]);

  function addTier() {
    setTiers([...tiers, { name: '', price: 0, quantity: null, description: '' }]);
  }

  function updateTier(index: number, field: keyof TicketTier, value: any) {
    const newTiers = [...tiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    setTiers(newTiers);
  }

  function removeTier(index: number) {
    if (tiers.length > 1) {
      setTiers(tiers.filter((_, i) => i !== index));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for auth
        body: JSON.stringify({
          title: name,
          description: `${tagline ? tagline + '\n\n' : ''}${description}`,
          startsAt: new Date(dateTime).toISOString(),
          venue: location,
          imageUrl: coverImageUrl || null,
          tickets: tiers.filter(t => t.name).map(t => ({
            name: t.name,
            description: t.description,
            price: Math.round(t.price * 100), // Convert to cents
            currency: 'CAD',
            quantity: t.quantity,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create event');
      }

      const event = await response.json();
      router.push(`/${event.id}`);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">Basic Info</h2>
        
        <div>
          <label className="block text-sm font-medium mb-1">Event Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Jin's Launch Party"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tagline</label>
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="A night of light, sound, and presence"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Date & Time *</label>
          <input
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Location *</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            placeholder="123 Main St, Toronto, ON or Virtual"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Cover Image URL</label>
          <input
            type="url"
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Tell people what your event is about..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Ticket Tiers */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Tickets</h2>
          <button
            type="button"
            onClick={addTier}
            className="text-orange-500 hover:text-orange-600 text-sm font-medium"
          >
            + Add Tier
          </button>
        </div>

        {tiers.map((tier, index) => (
          <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex-1 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Tier Name</label>
                  <input
                    type="text"
                    value={tier.name}
                    onChange={(e) => updateTier(index, 'name', e.target.value)}
                    placeholder="General Admission"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price (CAD)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={tier.price}
                    onChange={(e) => updateTier(index, 'price', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity (blank = unlimited)</label>
                  <input
                    type="number"
                    min="1"
                    value={tier.quantity || ''}
                    onChange={(e) => updateTier(index, 'quantity', e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="Unlimited"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <input
                    type="text"
                    value={tier.description}
                    onChange={(e) => updateTier(index, 'description', e.target.value)}
                    placeholder="What's included"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
                  />
                </div>
              </div>
              {tiers.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTier(index)}
                  className="ml-3 text-red-500 hover:text-red-600 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold rounded-lg transition"
      >
        {loading ? 'Creating...' : 'Create Event'}
      </button>
    </form>
  );
}
