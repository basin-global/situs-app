'use client'

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from "@/components/ui/button";
import { toast } from 'react-toastify';

export default function DatabaseUpdatePage() {
  const { user } = usePrivy();
  const [isUpdating, setIsUpdating] = useState(false);

  const updateDatabase = async () => {
    setIsUpdating(true);
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
        toast.success(`Database update completed. Accounts processed: ${data.details?.totalAccountsProcessed || 0}`);
      } else {
        toast.error(`Error updating database: ${data.error}`);
      }
    } catch (error) {
      console.error('Error updating database:', error);
      toast.error(`Failed to update database: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Database Update</h1>
      <p className="mb-4">Use this tool to update the database. This operation may take some time.</p>
      <Button
        onClick={updateDatabase}
        disabled={isUpdating}
        className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {isUpdating ? 'Updating...' : 'Update Database'}
      </Button>
    </div>
  );
}

