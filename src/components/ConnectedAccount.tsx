import React, { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { resolveENS } from '@/utils/simplehash';
import SitusOGAbi from "@/src/abi/SitusOG.json";

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function ConnectedAccount() {
  const { user } = usePrivy();
  const [displayName, setDisplayName] = useState<string>('');

  useEffect(() => {
    async function resolveAddress() {
      if (user?.wallet?.address) {
        const resolved = await resolveENS(user.wallet.address);
        setDisplayName(resolved !== user.wallet.address ? resolved : truncateAddress(user.wallet.address));
      }
    }
    resolveAddress();
  }, [user?.wallet?.address]);

  if (!user?.wallet?.address) {
    return null;
  }

  return (
    <div className="text-sm font-medium text-gray-300">
      Connected: {displayName}
    </div>
  );
}