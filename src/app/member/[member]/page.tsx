'use client';

import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { TabbedModules } from '@/components/TabbedModules';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import { useRouter } from 'next/navigation';

export default function MemberPage({ params }: { params: { member: string } }) {
  const { member } = params;
  const { user, authenticated, login } = usePrivy();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
  const [ensName, setEnsName] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const resolveAddressOrENS = async () => {
      if (ethers.isAddress(member)) {
        setResolvedAddress(member);
        try {
          const response = await fetch(`https://api.ensideas.com/ens/resolve/${member}`);
          const data = await response.json();
          setEnsName(data.name || null);
        } catch (error) {
          console.error('Error fetching ENS name:', error);
        }
        setIsLoading(false);
      } else {
        try {
          const response = await fetch(`https://api.ensideas.com/ens/resolve/${member}`);
          const data = await response.json();
          if (data.address) {
            setResolvedAddress(data.address);
            setEnsName(member);
            setIsLoading(false);
          } else {
            setError('Invalid ENS name or Ethereum address');
            setIsLoading(false);
          }
        } catch (err) {
          console.error('Error resolving ENS name:', err);
          setError('Error resolving ENS name or Ethereum address');
          setIsLoading(false);
        }
      }
    };

    resolveAddressOrENS();
  }, [member]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Address copied to clipboard!', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast.error('Failed to copy address');
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-foreground dark:text-foreground-dark bg-background dark:bg-background-dark">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-foreground dark:text-foreground-dark bg-background dark:bg-background-dark">
        <h1 className="text-3xl font-bold mb-4">Error</h1>
        <p className="text-xl mb-6">{error}</p>
        {!authenticated && (
          <button onClick={login} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            Login
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-background dark:bg-background-dark text-foreground dark:text-foreground-dark">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="relative group">
            <p 
              className="text-sm font-space-mono cursor-pointer text-center mb-2 opacity-70 text-gray-600 dark:text-gray-400"
              onClick={() => copyToClipboard(resolvedAddress || '')}
            >
              {ensName || resolvedAddress}
            </p>
            <h1 className="text-4xl font-bold mb-6 text-center">
              {authenticated && user?.wallet?.address?.toLowerCase() === resolvedAddress?.toLowerCase()
                ? "Your Account"
                : "Member Account"}
            </h1>
          </div>
          
          <div className="mb-6 flex justify-center">
            {resolvedAddress && <TabbedModules tbaAddress={resolvedAddress} />}
          </div>
        </div>
      </div>
    </div>
  );
}
