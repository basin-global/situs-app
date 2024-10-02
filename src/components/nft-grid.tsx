'use client'

// NFTGrid Component
// Designed for [situs] Accounts 721 layout but could maybe be used for Assets ( & Zora)

import Link from 'next/link';
import { NFT } from '@/utils/simplehash';
import { useParams } from 'next/navigation';

interface NFTGridProps {
  nfts: NFT[];
}

export function NFTGrid({ nfts }: NFTGridProps) {
  const params = useParams();
  const situs = params.situs as string;
  const contractAddress = params['contract-address'] as string;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {nfts.map(nft => (
        <Link 
          key={nft.id} 
          href={`/${situs}/accounts/${contractAddress}/${nft.id}`}
          className="border p-4 rounded-lg block hover:shadow-lg transition-shadow"
        >
          <img 
            src={nft.image} 
            alt={nft.name} 
            className="w-full h-48 object-cover mb-2" 
          />
          <h3 className="font-bold">{nft.name}</h3>
          <p className="text-sm">{nft.description}</p>
        </Link>
      ))}
    </div>
  );
}