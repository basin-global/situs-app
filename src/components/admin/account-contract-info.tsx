import React, { useEffect, useState } from 'react';
import { createPublicClient, http, Address } from 'viem';
import { base } from 'viem/chains';
import SitusOGAbi from '../../abi/SitusOG.json';
import { useOG } from '@/contexts/og-context';

const publicClient = createPublicClient({
  chain: base,
  transport: http()
});

interface AccountContractInfoProps {
  token_id: number;
}

const AccountContractInfo: React.FC<AccountContractInfoProps> = ({ token_id }) => {
  const { currentOG } = useOG();
  const [contractInfo, setContractInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <div className="bg-background dark:bg-background-dark rounded-lg p-6 mt-6">
      <h2 className="text-2xl font-bold mb-4 text-foreground dark:text-foreground-dark">Onchain Data</h2>
      <div className="flex items-start space-x-6">
        <img src={contractInfo.image} alt={contractInfo.name} className="w-32 h-32 object-cover rounded" />
        <div className="space-y-2 font-mono text-sm text-foreground dark:text-foreground-dark">
          <p><span className="font-semibold">Name:</span> {contractInfo.name}</p>
          <p><span className="font-semibold">Token ID:</span> {contractInfo.token_id}</p>
          <p><span className="font-semibold">Owner:</span> {truncateAddress(contractInfo.owner)}</p>
        </div>
      </div>
    </div>
  );
};

export default AccountContractInfo;
