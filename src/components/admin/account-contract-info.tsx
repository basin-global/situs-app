import React, { useEffect, useState } from 'react';
import { createPublicClient, http, Address } from 'viem';
import { base } from 'viem/chains';
import SitusOGAbi from '../../abi/SitusOG.json';
import { useOG } from '@/contexts/og-context';
import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';

const publicClient = createPublicClient({
  chain: base,
  transport: http()
});

interface AccountContractInfoProps {
  token_id: number;
}

export default function AccountContractInfo({ token_id }: AccountContractInfoProps) {
  const { currentOG } = useOG();
  const { user } = usePrivy();
  const [contractInfo, setContractInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ownerEns, setOwnerEns] = useState<string | null>(null);

  // Check if the logged-in user owns this account
  const isOwner = user?.wallet?.address && 
    contractInfo.owner && 
    user.wallet.address.toLowerCase() === contractInfo.owner.toLowerCase();

  useEffect(() => {
    const fetchContractInfo = async () => {
      if (!currentOG || !currentOG.contract_address || !token_id) {
        setError('No OG contract address or token ID available');
        setLoading(false);
        return;
      }

      try {
        const address = currentOG.contract_address as Address;
        const bigIntTokenId = BigInt(token_id);

        const [tokenURI, owner] = await Promise.all([
          publicClient.readContract({
            address,
            abi: SitusOGAbi,
            functionName: 'tokenURI',
            args: [bigIntTokenId],
          }),
          publicClient.readContract({
            address,
            abi: SitusOGAbi,
            functionName: 'ownerOf',
            args: [bigIntTokenId],
          }),
        ]);

        // Fetch ENS name for owner
        if (owner) {
          try {
            const response = await fetch(`/api/simplehash/ens?address=${owner}`);
            const data = await response.json();
            setOwnerEns(data.name);
          } catch (error) {
            console.error('Error fetching owner ENS:', error);
          }
        }

        const metadata = await fetchMetadata(tokenURI as string);

        setContractInfo({
          owner,
          name: metadata.name,
          image: metadata.image,
          token_id: token_id,
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching contract info:', err);
        setError('Failed to fetch contract information');
        setLoading(false);
      }
    };

    fetchContractInfo();
  }, [currentOG, token_id]);

  const fetchMetadata = async (uri: string) => {
    if (uri.startsWith('data:application/json;base64,')) {
      const base64Data = uri.split(',')[1];
      const jsonString = atob(base64Data);
      return JSON.parse(jsonString);
    } else {
      const response = await fetch(uri);
      return await response.json();
    }
  };

  if (loading) return <div className="text-center py-4">Loading token information...</div>;
  if (error) return <div className="text-center py-4 text-error">Error: {error}</div>;

  const truncateAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className="bg-muted dark:bg-muted-dark border border-border dark:border-border-dark rounded-lg p-4 md:p-6 max-w-5xl mx-auto">
      <h2 className="text-lg font-medium mb-4 text-foreground dark:text-foreground-dark">Onchain Data</h2>
      <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={contractInfo.image} 
          alt={contractInfo.name} 
          className="w-full md:w-32 h-32 object-cover rounded" 
        />
        <div className="space-y-2 font-mono text-sm text-foreground dark:text-foreground-dark">
          <div className="flex items-center">
            <span className="font-semibold mr-2">Name:</span>
            <span className={`break-all ${isOwner ? 'bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-600 font-bold' : ''}`}>
              {contractInfo.name}
            </span>
            {isOwner && (
              <div 
                className="w-2 h-2 flex-shrink-0 rounded-full bg-green-500 ml-2"
                title="You own this account"
              />
            )}
          </div>
          
          <div className="flex items-center">
            <span className="font-semibold mr-2">ID:</span>
            <a 
              href={`https://basescan.org/token/${currentOG?.contract_address}?a=${token_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-500"
            >
              {token_id}
            </a>
          </div>

          <div className="flex items-center">
            <span className="font-semibold mr-2">Owner:</span>
            <Link 
              href={`/member/${contractInfo.owner}`}
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-500"
            >
              {truncateAddress(contractInfo.owner)}
            </Link>
            {ownerEns && (
              <span className="ml-2 text-gray-500 dark:text-gray-400 break-all">
                ({ownerEns})
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
