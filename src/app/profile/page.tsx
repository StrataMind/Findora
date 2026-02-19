import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { signOut } from 'next-auth/react';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-serif mb-8">Profile</h1>

      <div className="max-w-2xl">
        <div className="border border-neutral-200 p-6 mb-6">
          <h2 className="text-2xl font-medium mb-4">Account Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-neutral-600 mb-1">Name</label>
              <p className="font-medium">{session.user.name || 'Not set'}</p>
            </div>
            
            <div>
              <label className="block text-sm text-neutral-600 mb-1">Email</label>
              <p className="font-medium">{session.user.email}</p>
            </div>
          </div>
        </div>

        <div className="border border-neutral-200 p-6">
          <h2 className="text-2xl font-medium mb-4">Actions</h2>
          
          <form action={async () => {
            'use server';
            await signOut({ redirectTo: '/' });
          }}>
            <button
              type="submit"
              className="bg-red-600 text-white px-6 py-2 hover:bg-red-700 transition"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
