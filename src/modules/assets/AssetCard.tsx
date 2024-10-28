import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import Link from 'next/link'
import Image from 'next/image'

interface AssetCardProps {
  asset: {
    nft_id: string
    name: string
    image_url: string
    video_url?: string
    audio_url?: string
    collection: {
      name: string
    }
    contract_address: string
    token_id: string
    chain: string
    contract: {
      type: string
    }
    owners: Array<{
      owner_address: string
      quantity: number
      quantity_string: string
      first_acquired_date: string
      last_acquired_date: string
    }>
  }
  tbaAddress: string
}

export default function AssetCard({ asset, tbaAddress }: AssetCardProps) {
  return (
    <Link href={`/assets/${asset.chain}/${asset.contract_address}/${asset.token_id}`} passHref>
      <Card className="overflow-hidden bg-white dark:bg-gray-800 transition-all duration-300 hover:shadow-lg cursor-pointer h-full rounded-lg">
        <CardContent className="p-0 h-full flex flex-col">
          <div className="aspect-square relative overflow-hidden flex-shrink-0">
            {asset.video_url ? (
              <video 
                src={asset.video_url}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <Image 
                src={asset.image_url} 
                alt={asset.name} 
                layout="fill"
                objectFit="cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="rounded-lg"
              />
            )}
          </div>
          <div className="p-4 flex-grow">
            <h3 className="font-bold text-lg mb-1 text-gray-900 dark:text-gray-100">{asset.name}</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">{asset.collection.name}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
