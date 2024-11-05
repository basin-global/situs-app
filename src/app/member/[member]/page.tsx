'use client';

import { useEffect, useState, useMemo } from 'react';
import { TabbedModules } from '@/components/TabbedModules';
import { toast } from 'react-toastify';
import { useWallets, usePrivy } from '@privy-io/react-auth';
import { isAddress } from 'viem';
import { useSearchParams } from 'next/navigation';

export default function MemberPage({ params }: { params: { member: string } }) {
  const { member } = params;
  const searchParams = useSearchParams();
  const initialModule = searchParams.get('module');
  const initialChain = searchParams.get('chain');
  
  const { wallets } = useWallets();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
  const [ensName, setEnsName] = useState<string | null>(null);
  const { authenticated, user } = usePrivy();

  const isOwner = useMemo(() => {
    if (!authenticated || !user?.wallet?.address || !resolvedAddress) return false;
    return user.wallet.address.toLowerCase() === resolvedAddress.toLowerCase();
  }, [authenticated, user?.wallet?.address, resolvedAddress]);

  useEffect(() => {
    const resolveAddressOrENS = async () => {
      try {
        const memberString = member.toLowerCase();
        
        if (isAddress(memberString)) {
          // If it's an address, fetch ENS name
          const response = await fetch(`/api/simplehash/ens?address=${memberString}`);
          const data = await response.json();
          setResolvedAddress(memberString);
          setEnsName(data.name || null);
        } else if (memberString.endsWith('.eth')) {
          // If it's ENS, fetch address
          const response = await fetch(`/api/simplehash/ens?name=${memberString}`);
          const data = await response.json();
          if (!data.address) {
            throw new Error('Invalid ENS name');
          }
          setResolvedAddress(data.address.toLowerCase());
          setEnsName(memberString);
        } else {
          throw new Error('Please use an Ethereum address or ENS name');
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error resolving address or ENS:', err);
        setError(err instanceof Error ? err.message : 'Invalid address or ENS name');
        setIsLoading(false);
      }
    };

    resolveAddressOrENS();
  }, [member]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Address copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast.error('Failed to copy address');
    });
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Error</h1>
        <p className="text-xl mb-6">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="relative group">
            <p 
              className="text-sm font-space-mono cursor-pointer text-center mb-2 opacity-0 group-hover:opacity-70 transition-opacity duration-300 delay-300 text-gray-600 dark:text-gray-400"
              onClick={() => resolvedAddress && copyToClipboard(resolvedAddress)}
            >
              {resolvedAddress}
            </p>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center">
                <h1 
                  className={`text-6xl font-bold mb-2 text-center cursor-pointer ${
                    isOwner ? 'bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-600' : ''
                  }`}
                  onClick={() => resolvedAddress && copyToClipboard(resolvedAddress)}
                >
                  {ensName || (isOwner ? "My Account" : "Member Account")}
                </h1>
                {isOwner && (
                  <div 
                    className="w-3 h-3 rounded-full bg-green-500 ml-2 mb-2"
                    title="This is your account"
                  />
                )}
              </div>
              {!isOwner && !ensName && resolvedAddress && (
                <p className="text-lg text-gray-500 dark:text-gray-400 -mt-1 mb-2">
                  {truncateAddress(resolvedAddress)}
                </p>
              )}
            </div>
          </div>
          
          <div className="mb-6 flex justify-center">
            {resolvedAddress && (
              <TabbedModules 
                address={resolvedAddress} 
                isTokenbound={false}
                isOwner={isOwner}
                initialModule={initialModule}
                initialChain={initialChain}
              />
            )}
          </div>
        </div>

        <div className="mt-12 mb-8 flex justify-center items-center">
          <div className="text-center relative group">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center">
                <h2 
                  className={`text-3xl font-bold cursor-pointer ${
                    isOwner ? 'bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-600' : ''
                  }`}
                  onClick={() => resolvedAddress && copyToClipboard(resolvedAddress)}
                >
                  {ensName || (isOwner ? "My Account" : "Member Account")}
                </h2>
                {isOwner && (
                  <div 
                    className="w-2 h-2 rounded-full bg-green-500 ml-2"
                    title="This is your account"
                  />
                )}
              </div>
              {!isOwner && !ensName && resolvedAddress && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {truncateAddress(resolvedAddress)}
                </p>
              )}
            </div>
            <p 
              className="text-sm font-space-mono cursor-pointer text-center mt-2 opacity-0 group-hover:opacity-70 transition-opacity duration-300 delay-300 text-gray-600 dark:text-gray-400"
              onClick={() => resolvedAddress && copyToClipboard(resolvedAddress)}
            >
              {resolvedAddress}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
