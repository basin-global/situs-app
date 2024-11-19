'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Asset } from '@/modules/assets';

interface MetadataAssetsProps {
  address: string;
  selectedChain: string;
}

export default function MetadataAssets({ address, selectedChain }: MetadataAssetsProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAssets() {
      try {
        const response = await axios.get(`/api/simplehash/nft?address=${address}&chain=${selectedChain}`);
        setAssets(response.data.nfts || []);
      } catch (error) {
        console.error('Error fetching assets:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAssets();
  }, [address, selectedChain]);

  if (loading) {
    return <div className="p-4 text-gray-400">Loading assets...</div>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4">
      {assets.map((asset) => (
        <div 
          key={asset.nft_id}
          className="bg-black/40 rounded-lg overflow-hidden hover:bg-black/60 transition-colors"
        >
          <div className="aspect-square relative">
            <img 
              src={asset.image_url} 
              alt={asset.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          <div className="p-2">
            <div className="text-sm text-gray-200 truncate">{asset.name}</div>
            <div className="text-xs text-gray-400 truncate">{asset.collection.name}</div>
          </div>
        </div>
      ))}
    </div>
  );
} 