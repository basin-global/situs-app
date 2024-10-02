'use client';

import React, { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useSitus } from '@/contexts/situs-context';
import { checkUserOGs } from '@/utils/simplehash';

export function UserOGs() {
  const { user, authenticated } = usePrivy();
  const { situsOGs } = useSitus();
  const [userOGs, setUserOGs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUserOGs() {
      if (authenticated && user?.wallet?.address) {
        setIsLoading(true);
        setError(null);
        try {
          console.log('Fetching OGs for user:', user.wallet.address);
          console.log('SitusOGs:', situsOGs);
          const contractAddresses = situsOGs.map(og => og.contractAddress);
          console.log('Contract addresses to be passed:', contractAddresses);
          console.log('Contract addresses as string:', contractAddresses.join(','));
          const ownedContracts = await checkUserOGs(user.wallet.address, contractAddresses);
          console.log('Owned contracts:', ownedContracts);
          const userOwnedOGs = situsOGs.filter(og => ownedContracts.includes(og.contractAddress));
          console.log('User owned OGs:', userOwnedOGs);
          setUserOGs(userOwnedOGs);
        } catch (error) {
          console.error('Error checking user OGs:', error);
          setError(error.message);
        } finally {
          setIsLoading(false);
        }
      } else {
        setUserOGs([]);
      }
    }

    fetchUserOGs();
  }, [authenticated, user, situsOGs]);

  if (!authenticated || !user?.wallet?.address) {
    return null;
  }

  if (isLoading) {
    return <div>Loading your OGs...</div>;
  }

  if (error) {
    return <div>Error loading OGs: {error}</div>;
  }

  if (userOGs.length === 0) {
    return <p>You are not part of any OGs yet.</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Your OGs</h2>
      <ul className="list-disc pl-5">
        {userOGs.map((og) => (
          <li key={og.contractAddress} className="mb-2">
            {og.name}
          </li>
        ))}
      </ul>
    </div>
  );
}