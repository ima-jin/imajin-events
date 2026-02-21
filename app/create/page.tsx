import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import EventCreateForm from './form';

export default async function CreateEventPage() {
  const session = await getSession();
  
  if (!session) {
    // Redirect to auth with return URL
    redirect('https://auth.imajin.ai/login?next=https://events.imajin.ai/create');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create Event</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Logged in as @{session.handle || session.did.slice(0, 20)}
          </p>
        </div>
        
        <EventCreateForm organizerDid={session.did} />
      </div>
    </div>
  );
}
