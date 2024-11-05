import React, { useEffect, useState } from 'react';
import { createPublicClient, http, Address } from 'viem';
import { base } from 'viem/chains';
import SitusOGAbi from '../../abi/SitusOG.json';
import { useOG } from '@/contexts/og-context';

const publicClient = createPublicClient({
  chain: base,
  transport: http()
});

// Define types for the contract functions
type ContractFunctions = {
  name: () => Promise<string>;
  buyingEnabled: () => Promise<boolean>;
  price: () => Promise<bigint>;
  referral: () => Promise<bigint>;
  royalty: () => Promise<bigint>;
  royaltyFeeReceiver: () => Promise<Address>;
  royaltyFeeUpdater: () => Promise<Address>;
  metadataAddress: () => Promise<Address>;
  minter: () => Promise<Address>;
  totalSupply: () => Promise<bigint>;
  owner: () => Promise<Address>;
};

const OGContractInfo: React.FC = () => {
  const { currentOG } = useOG();
  const [contractInfo, setContractInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ensNames, setEnsNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchContractInfo = async () => {
      if (!currentOG || !currentOG.contract_address) {
        setError('No OG contract address available');
        setLoading(false);
        return;
      }

      try {
        const address = currentOG.contract_address as Address;

        const contractFunctions: ContractFunctions = {
          name: () => publicClient.readContract({ address, abi: SitusOGAbi, functionName: 'name' }) as Promise<string>,
          buyingEnabled: () => publicClient.readContract({ address, abi: SitusOGAbi, functionName: 'buyingEnabled' }) as Promise<boolean>,
          price: () => publicClient.readContract({ address, abi: SitusOGAbi, functionName: 'price' }) as Promise<bigint>,
          referral: () => publicClient.readContract({ address, abi: SitusOGAbi, functionName: 'referral' }) as Promise<bigint>,
          royalty: () => publicClient.readContract({ address, abi: SitusOGAbi, functionName: 'royalty' }) as Promise<bigint>,
          royaltyFeeReceiver: () => publicClient.readContract({ address, abi: SitusOGAbi, functionName: 'royaltyFeeReceiver' }) as Promise<Address>,
          royaltyFeeUpdater: () => publicClient.readContract({ address, abi: SitusOGAbi, functionName: 'royaltyFeeUpdater' }) as Promise<Address>,
          metadataAddress: () => publicClient.readContract({ address, abi: SitusOGAbi, functionName: 'metadataAddress' }) as Promise<Address>,
          minter: () => publicClient.readContract({ address, abi: SitusOGAbi, functionName: 'minter' }) as Promise<Address>,
          totalSupply: () => publicClient.readContract({ address, abi: SitusOGAbi, functionName: 'totalSupply' }) as Promise<bigint>,
          owner: () => publicClient.readContract({ address, abi: SitusOGAbi, functionName: 'owner' }) as Promise<Address>,
        };

        const [
          name,
          buyingEnabled,
          price,
          referral,
          royalty,
          royaltyFeeReceiver,
          royaltyFeeUpdater,
          metadataAddress,
          minter,
          totalSupply,
          owner
        ] = await Promise.all([
          contractFunctions.name(),
          contractFunctions.buyingEnabled(),
          contractFunctions.price(),
          contractFunctions.referral(),
          contractFunctions.royalty(),
          contractFunctions.royaltyFeeReceiver(),
          contractFunctions.royaltyFeeUpdater(),
          contractFunctions.metadataAddress(),
          contractFunctions.minter(),
          contractFunctions.totalSupply(),
          contractFunctions.owner()
        ]);

        setContractInfo({
          name,
          buyingEnabled,
          price: (Number(price) / 1e18).toString(), // Convert from wei to ether
          referral: referral.toString(),
          royalty: royalty.toString(),
          royaltyFeeReceiver,
          royaltyFeeUpdater,
          metadataAddress,
          minter,
          totalSupply: totalSupply.toString(),
          tldOwner: owner
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching contract info:', err);
        setError('Failed to fetch contract information');
        setLoading(false);
      }
    };

    fetchContractInfo();
  }, [currentOG]);

  useEffect(() => {
    const fetchENSNames = async (addresses: string[]) => {
      const names: Record<string, string> = {};
      for (const address of addresses) {
        try {
          const response = await fetch(`/api/simplehash/ens?address=${address}`);
          const data = await response.json();
          if (data.name) {
            names[address.toLowerCase()] = data.name;
          }
        } catch (error) {
          console.error('Error fetching ENS for', address, error);
        }
      }
      setEnsNames(names);
    };

    if (contractInfo) {
      const addresses = [
        contractInfo.royaltyFeeReceiver,
        contractInfo.royaltyFeeUpdater,
        contractInfo.metadataAddress,
        contractInfo.minter,
        contractInfo.tldOwner
      ].filter(Boolean);
      
      fetchENSNames(addresses);
    }
  }, [contractInfo]);

  const formatAddress = (address: string) => {
    const ensName = ensNames[address.toLowerCase()];
    return (
      <div className="font-mono text-sm">
        {truncateAddress(address)}
        {ensName && (
          <span className="ml-2 text-gray-500 dark:text-gray-400">
            ({ensName})
          </span>
        )}
      </div>
    );
  };

  if (loading) return <div className="text-center py-4 text-foreground dark:text-foreground-dark">Loading contract information...</div>;
  if (error) return <div className="text-center py-4 text-error dark:text-error-dark">Error: {error}</div>;

  const truncateAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;
  const formatPercentage = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
    return (numValue / 100).toFixed(2) + '%';
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mt-6 shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">OG Contract Information</h2>
      <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-2">
        {Object.entries(contractInfo).map(([key, value]) => (
          <React.Fragment key={key}>
            <div className="font-mono text-sm text-gray-600 dark:text-gray-300">{key}:</div>
            <div className="font-mono text-sm text-gray-800 dark:text-gray-100">
              {key === 'price' && `${value} ETH`}
              {(key === 'referral' || key === 'royalty') && 
                typeof value === 'string' && 
                `${value} bps (${formatPercentage(value)})`
              }
              {key === 'buyingEnabled' && (
                <span className={
                  value === true || value === 'true' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }>
                  {String(value)}
                </span>
              )}
              {(key === 'royaltyFeeReceiver' || 
                key === 'royaltyFeeUpdater' || 
                key === 'metadataAddress' || 
                key === 'minter' || 
                key === 'tldOwner') && 
                typeof value === 'string' && formatAddress(value)
              }
              {key !== 'price' && 
                key !== 'referral' && 
                key !== 'royalty' && 
                key !== 'buyingEnabled' && 
                !['royaltyFeeReceiver', 'royaltyFeeUpdater', 'metadataAddress', 'minter', 'tldOwner'].includes(key) && 
                String(value)
              }
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default OGContractInfo;
