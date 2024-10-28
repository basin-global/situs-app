'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isSpamContract } from '@/config/spamContracts';
import Image from 'next/image';
import CustomAudioPlayer from '@/components/CustomAudioPlayer';
import { usePrivy } from '@privy-io/react-auth'; // Import usePrivy hook

interface AssetDetails {
  name?: string;
  description?: string;  // Add this line
  image_url?: string;
  video_url?: string;
  collection?: {
    name?: string;
  };
  contract_address?: string;
  token_id?: string;
  audio_url?: string;
  contract?: {
    type?: string;
  };
  owners?: Array<{
    owner_address: string;
    quantity: number;
  }>;
}

export default function AssetDetailPage({ params }: { params: { chain: string; contract: string; tokenId: string } }) {
  const router = useRouter();
  const { chain, contract, tokenId } = params;
  const [assetDetails, setAssetDetails] = useState<AssetDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isSpam = isSpamContract(chain, contract);
  const { user } = usePrivy(); // Get the user object from Privy

  useEffect(() => {
    async function fetchAssetDetails() {
      setLoading(true);
      try {
        const response = await fetch(`/api/simplehash/nft?chain=${chain}&contractAddress=${contract}&tokenId=${tokenId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Asset details:', data);
        setAssetDetails(data);
      } catch (error) {
        console.error('Error fetching asset details:', error);
        setError('Failed to fetch asset details. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchAssetDetails();
  }, [chain, contract, tokenId]);

  const quantity = assetDetails?.owners?.find(owner => 
    owner.owner_address.toLowerCase() === user?.wallet?.address?.toLowerCase()
  )?.quantity || 0;

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading asset details...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen">Error: {error}</div>;
  }

  if (!assetDetails) {
    return <div className="flex justify-center items-center h-screen">Asset not found</div>;
  }

  const getOpenSeaUrl = (chain: string, contract: string, tokenId: string) => {
    return `https://opensea.io/assets/${chain}/${contract}/${tokenId}`;
  };

  const getRaribleUrl = (chain: string, contract: string, tokenId: string) => {
    return `https://rarible.com/token/${chain}/${contract}:${tokenId}`;
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-background dark:bg-background-dark">
      <div className="max-w-2xl w-full px-4 py-8">
        {isSpam && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Warning!</strong>
            <span className="block sm:inline"> This contract has been marked as spam.</span>
          </div>
        )}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold mb-4 text-center text-gray-800 dark:text-gray-200">
            {assetDetails.name || 'Unnamed Asset'}
          </h1>
          {assetDetails.contract?.type === 'ERC1155' && quantity > 0 && (
            <div className="text-center mb-4 text-lg font-semibold text-blue-600 dark:text-blue-400">
              You own: {quantity}
            </div>
          )}
          <div className="aspect-square relative overflow-hidden mb-4">
            {assetDetails.video_url ? (
              <video 
                src={assetDetails.video_url}
                controls
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <img 
                  src={assetDetails.image_url}
                  alt={assetDetails.name || 'Asset'}
                />
                {assetDetails.audio_url && (
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-black bg-opacity-50">
                    <CustomAudioPlayer src={assetDetails.audio_url} />
                  </div>
                )}
              </>
            )}
          </div>
          <div className="space-y-2 text-gray-100 dark:text-gray-200">
            {assetDetails.description && (
              <p className="whitespace-pre-wrap mb-4 text-lg">{assetDetails.description}</p>
            )}
          </div>
          <div className="flex flex-col items-center space-y-4 mb-4">
            {assetDetails.collection?.name && (
              <div className="text-gray-600 dark:text-gray-300 text-sm">
                Collection: <span className="font-medium">{assetDetails.collection.name}</span>
              </div>
            )}
            <div className="flex items-center space-x-6">
              <a href={getOpenSeaUrl(chain, contract, tokenId)} target="_blank" rel="noopener noreferrer" className="flex items-center hover:opacity-80">
                <Image src="/assets/icons/opensea.svg" alt="OpenSea" width={24} height={24} />
              </a>
              <a href={getRaribleUrl(chain, contract, tokenId)} target="_blank" rel="noopener noreferrer" className="flex items-center hover:opacity-80">
                <Image src="/assets/icons/rarible.svg" alt="Rarible" width={24} height={24} />
              </a>
            </div>
          </div>
          <div className="mt-6 text-center">
            <button 
              onClick={() => router.back()} 
              className="text-blue-500 hover:underline cursor-pointer"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
