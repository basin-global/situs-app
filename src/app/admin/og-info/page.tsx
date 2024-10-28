'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import OGContractInfo from '@/components/admin/og-contract-info';
import { isAdmin } from '@/utils/adminUtils';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { AdminOGSelector } from '@/components/admin/AdminOGSelector';
import { useOG } from '@/contexts/og-context';

export default function OGInfoPage() {
  const router = useRouter();
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { currentOG } = useOG();

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
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">OG Contract Information</h1>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Select OG:</h2>
        <AdminOGSelector />
      </div>
      {currentOG && <OGContractInfo />}
    </div>
  );
}
