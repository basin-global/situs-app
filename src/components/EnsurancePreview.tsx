'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ensuranceContracts } from '@/modules/ensurance/config'
import { EnsurancePreviewProps } from '@/types';

interface SimpleHashNFT {
  nft_id: string;
  token_id: string;
  name: string;
  image_url: string;
  video_url?: string;
  chain: string;
}

export default function EnsurancePreview({ contractAddress, og }: EnsurancePreviewProps) {
  const [nfts, setNfts] = useState<SimpleHashNFT[]>([])

  useEffect(() => {
    Promise.all([
      fetch(`/api/simplehash/nft?chain=base&contractAddress=${ensuranceContracts.base}`),
      fetch(`/api/simplehash/nft?chain=arbitrum&contractAddress=${ensuranceContracts.arbitrum}`)
    ])
      .then(([baseRes, arbRes]) => Promise.all([baseRes.json(), arbRes.json()]))
      .then(([baseData, arbData]) => {
        const allNfts = [
          ...(baseData.nfts || []).slice(0, 10),
          ...(arbData.nfts || []).slice(0, 10)
        ].sort((a, b) => Number(b.token_id) - Number(a.token_id))
        .slice(0, 20)

        setNfts(allNfts)
      })
  }, [])

  return (
    <div className="bg-muted/50 dark:bg-muted-dark/50 rounded-xl p-8 backdrop-blur-sm">
      <div className="mb-8">
        <div className="flex flex-col space-y-2 mb-4">
          <h3 className="text-2xl font-bold">Ensuring Impact</h3>
          <div className="flex items-center justify-between">
            <p className="text-lg">
              <span className="bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-500 text-transparent bg-clip-text font-semibold">
                Certificates of Ensurance
              </span>
              {' '}<span className="text-foreground/90 dark:text-foreground-dark/90">reduce risk and increase resilience</span>
            </p>
            <Link 
              href={`/${og}/ensurance/all`}
              className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
            >
              View All →
            </Link>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {nfts.map((nft) => (
          <Link
            key={nft.nft_id}
            href={`/${og}/ensurance`}
            className="group block"
          >
            <div className="aspect-square relative rounded-lg overflow-hidden bg-black/5 transition-transform duration-300 group-hover:scale-105 mb-2">
              {nft.video_url ? (
                <video
                  src={nft.video_url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : nft.image_url && (
                <Image
                  src={nft.image_url}
                  alt={nft.name || `#${nft.token_id}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                />
              )}
            </div>
            <p className="text-xs font-medium truncate px-1 text-foreground/90 dark:text-foreground-dark/90 group-hover:text-foreground dark:group-hover:text-foreground-dark transition-colors">
              {nft.name || `#${nft.token_id}`}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
} 