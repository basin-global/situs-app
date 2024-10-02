'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { UserOGs } from "@/components/UserOGs"; // Add this import

export default function ProfilePage() {
  const { ready, authenticated, user, logout, createWallet, linkWallet } = usePrivy();
  const { wallets } = useWallets();
  const [ensName, setEnsName] = useState<string | null>(null);

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
    return <div className="text-foreground">Loading...</div>;
  }

  if (!authenticated) {
    return <div className="text-foreground">Please log in to view your profile.</div>;
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

  const isAdmin = (address: string | undefined) => {
    const adminAddresses = [
      '0xEAF9830bB7a38A3CEbcaCa3Ff9F626C424F3fB55',
      '0x79c2D72552Df1C5d551B812Eca906a90Ce9D840A',
      '0xcb598dD4770b06E744EbF5B31Bb3D6a538FBE4fE'
    ];
    return address ? adminAddresses.map(a => a.toLowerCase()).includes(address.toLowerCase()) : false;
  };

  const updateDatabase = async () => {
    try {
      const response = await fetch(`/api/update-database`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress: user?.wallet?.address }),
      });
      const data = await response.json();
      console.log('Update response:', data);
      if (response.ok) {
        alert(`Database update completed. Message: ${data.message}\nAccounts processed: ${data.details?.totalAccountsProcessed || 0}`);
      } else {
        alert(`Error updating database: ${data.error}`);
      }
    } catch (error) {
      console.error('Error updating database:', error);
      alert(`Failed to update database: ${error instanceof Error ? error.message : String(error)}`);
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
          <ul className="list-disc list-inside text-foreground">
            {wallets.map((wallet, index) => (
              <li key={index}>
                {wallet.address} ({wallet.walletClientType})
              </li>
            ))}
          </ul>
        </div>
        <div className="flex space-x-4 mb-4">
          <Button
            onClick={createWallet}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Create New Wallet (soon)
          </Button>
          <Button
            onClick={linkWallet}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            Link Existing Wallet (soon)
          </Button>
        </div>
        
        {/* Add UserOGs component here */}
        <div className="mt-8 mb-8 bg-background p-6 rounded-lg shadow-inner">
          <UserOGs />
        </div>
        
        {isAdmin(user?.wallet?.address) && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">SITUS Admin</h2>
            <div className="flex space-x-4 mb-4">
              <Button
                onClick={updateDatabase}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Update Database
              </Button>
            </div>
          </div>
        )}
        
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