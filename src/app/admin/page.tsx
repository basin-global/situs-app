'use client'

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isAdmin } from '@/utils/adminUtils';
import { usePrivy, useWallets } from '@privy-io/react-auth';

export default function AdminPage() {
  const router = useRouter();
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (ready && authenticated && wallets.length > 0) {
      const userAddress = wallets[0].address;
      if (isAdmin(userAddress)) {
        setIsAuthorized(true);
      } else {
        router.push('/'); // Redirect to home if not admin
      }
    } else if (ready && !authenticated) {
      router.push('/'); // Redirect to home if not authenticated
    }
  }, [ready, authenticated, wallets, router]);

  if (!isAuthorized) {
    return null; // Or a loading state
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/admin/og-info" className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">OG Contract Info</h2>
          <p className="text-gray-600 dark:text-gray-300">View detailed information about the OG contract.</p>
        </Link>
        <Link href="/admin/database-update" className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Database Update</h2>
          <p className="text-gray-600 dark:text-gray-300">Update the database with the latest information.</p>
        </Link>
      </div>
    </main>
  );
}
