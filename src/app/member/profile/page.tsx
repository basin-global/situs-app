'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { ready, authenticated, user, logout, login } = usePrivy();
  const { wallets } = useWallets();
  const [ensName, setEnsName] = useState<string | null>(null);

  useEffect(() => {
    console.log('Privy ready:', ready);
    console.log('Authenticated:', authenticated);
    console.log('Wallets:', wallets);
  }, [ready, authenticated, wallets]);

  useEffect(() => {
    const fetchEnsName = async () => {
      if (user?.wallet?.address) {
        try {
          const response = await fetch(`https://api.ensideas.com/ens/resolve/${user.wallet.address}`);
          const data = await response.json();
          setEnsName(data.name || null);
        } catch (error) {
          console.error('Error fetching ENS name:', error);
        }
      }
    };

    fetchEnsName();
  }, [user]);

  if (!ready) {
    return <div>Loading Privy...</div>;
  }

  if (!authenticated) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-xl mb-4 text-gray-700 dark:text-gray-300">Please log in to view your profile.</p>
        <Button 
          onClick={login}
          className="bg-green-600 text-white p-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition duration-300"
        >
          LOGIN
        </Button>
      </div>
    );
  }

  const getAccountInfo = (account: any) => {
    switch (account.type) {
      case 'email':
        return `Email: ${account.address}`;
      case 'wallet':
        return `Wallet: ${account.address}`;
      case 'phone':
        return `Phone: ${account.phoneNumber}`;
      default:
        return `${account.type}: ${JSON.stringify(account)}`;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 text-foreground bg-background">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      <div className="bg-muted shadow-xl rounded-lg px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-muted-foreground text-sm font-bold mb-2">
            Wallet Address:
          </label>
          <p className="text-foreground">{user?.wallet?.address}</p>
        </div>
        {ensName && (
          <div className="mb-4">
            <label className="block text-muted-foreground text-sm font-bold mb-2">
              ENS Name:
            </label>
            <p className="text-foreground">{ensName}</p>
          </div>
        )}
        <div className="mb-4">
          <label className="block text-muted-foreground text-sm font-bold mb-2">
            Email:
          </label>
          <p className="text-foreground">{user?.email?.address || 'Not provided'}</p>
        </div>
        <div className="mb-4">
          <label className="block text-muted-foreground text-sm font-bold mb-2">
            Linked Accounts:
          </label>
          <ul className="list-disc list-inside text-foreground">
            {user?.linkedAccounts?.map((account, index) => (
              <li key={index}>
                {getAccountInfo(account)}
              </li>
            ))}
          </ul>
        </div>
        <div className="mb-4">
          <label className="block text-muted-foreground text-sm font-bold mb-2">
            Connected Wallets:
          </label>
          <ul className="list-none text-foreground">
            {wallets.map((wallet, index) => (
              <li key={index} className="mb-2">
                {wallet.address} ({wallet.walletClientType})
              </li>
            ))}
          </ul>
        </div>
        
        {/* Add UserOGs component here */}
        <div className="mt-8 mb-8 bg-background p-6 rounded-lg shadow-inner">
        </div>
        
        <Button
          onClick={logout}
          className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
          Logout
        </Button>
      </div>
    </div>
  );
}
