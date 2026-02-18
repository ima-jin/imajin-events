'use client';

import { useState } from 'react';
import type { TicketType } from '@/src/db/schema';

interface Props {
  eventId: string;
  eventTitle: string;
  ticket: TicketType;
}

export function TicketPurchase({ eventId, eventTitle, ticket }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const available = ticket.quantity === null 
    ? 'Unlimited' 
    : `${ticket.quantity - (ticket.sold ?? 0)} left`;
  
  const soldOut = ticket.quantity !== null && (ticket.sold ?? 0) >= ticket.quantity;
  
  const handlePurchase = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          ticketTypeId: ticket.id,
          quantity: 1,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create checkout');
      }
      
      const { url } = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };
  
  const formatPrice = (cents: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(cents / 100);
  };
  
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-orange-300 dark:hover:border-orange-600 transition">
      <div className="flex-1">
        <h3 className="font-semibold text-lg">{ticket.name}</h3>
        {ticket.description && (
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            {ticket.description}
          </p>
        )}
        {Array.isArray(ticket.perks) && ticket.perks.length > 0 && (
          <ul className="mt-2 text-sm text-gray-500">
            {ticket.perks.map((perk, i) => (
              <li key={i} className="flex items-center gap-1">
                <span>✓</span> {String(perk)}
              </li>
            ))}
          </ul>
        )}
        <p className="text-sm text-gray-500 mt-2">{available}</p>
      </div>
      
      <div className="text-right ml-4">
        <div className="text-2xl font-bold mb-2">
          {ticket.price === 0 ? 'Free' : formatPrice(ticket.price, ticket.currency)}
        </div>
        
        {error && (
          <p className="text-red-500 text-sm mb-2">{error}</p>
        )}
        
        <button
          onClick={handlePurchase}
          disabled={loading || soldOut}
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            soldOut
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : loading
              ? 'bg-orange-400 text-white cursor-wait'
              : 'bg-orange-500 text-white hover:bg-orange-600'
          }`}
        >
          {soldOut ? 'Sold Out' : loading ? 'Loading...' : 'Get Ticket'}
        </button>
      </div>
    </div>
  );
}
