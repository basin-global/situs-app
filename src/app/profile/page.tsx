'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useState, useEffect } from 'react';

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
    return <div>Loading...</div>;
  }

  if (!authenticated) {
    return <div>Please log in to view your profile.</div>;
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

  const handleCreateWallet = async () => {
    try {
      await createWallet();
      // Wallet creation successful
    } catch (error) {
      console.error('Error creating wallet:', error);
    }
  };

  const handleLinkWallet = async () => {
    try {
      await linkWallet();
      // Wallet linking successful
    } catch (error) {
      console.error('Error linking wallet:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Wallet Address:
          </label>
          <p className="text-gray-700">{user?.wallet?.address}</p>
        </div>
        {ensName && (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              ENS Name:
            </label>
            <p className="text-gray-700">{ensName}</p>
          </div>
        )}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Email:
          </label>
          <p className="text-gray-700">{user?.email?.address || 'Not provided'}</p>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Linked Accounts:
          </label>
          <ul className="list-disc list-inside">
            {user?.linkedAccounts?.map((account, index) => (
              <li key={index} className="text-gray-700">
                {getAccountInfo(account)}
              </li>
            ))}
          </ul>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Connected Wallets:
          </label>
          <ul className="list-disc list-inside">
            {wallets.map((wallet, index) => (
              <li key={index} className="text-gray-700">
                {wallet.address} ({wallet.walletClientType})
              </li>
            ))}
          </ul>
        </div>
        <div className="flex space-x-4 mb-4">
          <button
            onClick={handleCreateWallet}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Create New Wallet
          </button>
          <button
            onClick={handleLinkWallet}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Link Existing Wallet
          </button>
        </div>
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Logout
        </button>
      </div>
    </div>
  );
}