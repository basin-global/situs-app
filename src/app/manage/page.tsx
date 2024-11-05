'use client'

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isAdmin } from '@/utils/adminUtils';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { toast } from 'react-toastify';
import { ValidationReport } from '@/types';

interface MissingAccount {
  og: string;
  name: string;
  id: number;
}

interface VerificationResponse {
  report: {
    summary: string;
    accounts: {
      missing: string[];
    };
  };
}

interface ReportData {
  report: {
    accounts?: {
      missing?: string[];
      // ... other report properties
    };
  };
}

interface ParsedAccount {
  og: string;
  name: string;
  id: number;
}

export default function AdminPage() {
  const router = useRouter();
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [verificationReport, setVerificationReport] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [missingAccounts, setMissingAccounts] = useState<Array<{og: string, name: string, id: number}>>([]);
  const [isFixing, setIsFixing] = useState(false);
  const [verificationData, setVerificationData] = useState<ValidationReport | null>(null);

  useEffect(() => {
    if (ready && authenticated && wallets.length > 0) {
      const userAddress = wallets[0].address;
      if (isAdmin(userAddress)) {
        setIsAuthorized(true);
      } else {
        router.push('/');
      }
    } else if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, wallets, router]);

  const handleVerifyDatabase = async () => {
    if (!wallets[0]?.address) return;
    
    setIsVerifying(true);
    try {
      const response = await fetch('/api/verify-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          walletAddress: wallets[0].address
        })
      });

      const data = await response.json();
      if (data.report) {
        setVerificationReport(data.report.summary);
        setVerificationData(data.report);
        
        if (data.report.accounts?.missing && Array.isArray(data.report.accounts.missing)) {
          const parsed = data.report.accounts.missing
            .map((item: string) => {
              const match = item.match(/^(.+?):(.+?)\s*\(ID:\s*(\d+)\)$/);
              if (!match) return null;
              const [_, og, name, idStr] = match;
              return {
                og,
                name,
                id: parseInt(idStr, 10)
              };
            })
            .filter((item: ParsedAccount | null): item is ParsedAccount => item !== null);
          
          setMissingAccounts(parsed);
        }
      }
    } catch (error) {
      console.error('Error verifying database:', error);
      toast.error('Error verifying database');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFixMismatches = async () => {
    if (!wallets[0]?.address || !verificationData) return;
    
    setIsFixing(true);
    try {
      const response = await fetch('/api/fix-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          walletAddress: wallets[0].address,
          report: verificationData
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(data.message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        if (data.details) {
          Object.entries(data.details).forEach(([key, message]) => {
            if (message && typeof message === 'string' && !message.includes('Fixed 0')) {
              toast.info(message, {
                position: "top-right",
                autoClose: 8000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              });
            }
          });
        }

        setTimeout(() => {
          handleVerifyDatabase();
        }, 2000);
      }
    } catch (error) {
      console.error('Error fixing database:', error);
      toast.error('Failed to fix database mismatches', {
        position: "top-right",
        autoClose: 8000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsFixing(false);
    }
  };

  if (!isAuthorized) {
    return null;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link href="/manage/og-info" className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">OG Contract Info</h2>
          <p className="text-gray-600 dark:text-gray-300">View detailed information about the OG contract.</p>
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Database Verification</h2>
          <div className="space-x-4">
            <button
              onClick={handleVerifyDatabase}
              disabled={isVerifying}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {isVerifying ? 'Verifying...' : 'Verify Database'}
            </button>
            {verificationData && (
              <button
                onClick={handleFixMismatches}
                disabled={isFixing}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                {isFixing ? 'Fixing...' : 'Fix Mismatches'}
              </button>
            )}
          </div>
        </div>

        {verificationReport && (
          <div className="mt-4">
            <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-auto whitespace-pre-wrap text-sm font-mono">
              {verificationReport}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}
