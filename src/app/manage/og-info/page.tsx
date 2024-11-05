'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import OGContractInfo from '@/components/admin/og-contract-info';
import { isAdmin } from '@/utils/adminUtils';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { AdminOGSelector } from '@/components/admin/AdminOGSelector';
import { useOG } from '@/contexts/og-context';

// Utility function to truncate addresses
const truncateAddress = (address: string) => {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export default function OGInfoPage() {
  const router = useRouter();
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { currentOG } = useOG();
  const [ensName, setEnsName] = useState<string | null>(null);

  useEffect(() => {
    if (ready && authenticated && wallets.length > 0) {
      const userAddress = wallets[0].address;
      if (isAdmin(userAddress)) {
        setIsAuthorized(true);
        // Fetch ENS name for admin
        const fetchEns = async () => {
          try {
            const response = await fetch(`/api/simplehash/ens?address=${userAddress}`);
            const data = await response.json();
            setEnsName(data.name);
          } catch (error) {
            console.error('Error fetching ENS:', error);
          }
        };
        fetchEns();
      } else {
        router.push('/');
      }
    } else if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, wallets, router]);

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">OG Contract Information</h1>
        <div className="text-right">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {ensName && <span className="block">{ensName}</span>}
            <span className="block">{wallets[0] && truncateAddress(wallets[0].address)}</span>
          </p>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Select OG:</h2>
        <AdminOGSelector />
      </div>
      {currentOG && <OGContractInfo />}
    </div>
  );
}
