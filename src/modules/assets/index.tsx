import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import AssetCard from './AssetCard'
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ensuranceContracts, isEnsuranceToken } from '@/modules/ensurance/config'
import InfiniteScroll from 'react-infinite-scroll-component'
import { AssetSearch } from './AssetSearch'

interface Asset {
  nft_id: string;
  name: string;
  image_url: string;
  video_url?: string;
  audio_url?: string;
  collection: {
    name: string;
  };
  contract_address: string;
  token_id: string;
  chain: string;
  contract: {
    type: string;
  };
  owners: Array<{
    owner_address: string;
    quantity: number;
    quantity_string: string;
    first_acquired_date: string;
    last_acquired_date: string;
  }>;
  description?: string;
}

interface AssetsModuleProps {
  tbaAddress: string;
  selectedChain: string;
  isEnsurance?: boolean;
}

export default function AssetsModule({ 
  tbaAddress, 
  selectedChain, 
  isEnsurance
}: AssetsModuleProps) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [displayedAssets, setDisplayedAssets] = useState<Asset[]>([])
  const [hasMore, setHasMore] = useState(true)
  const ITEMS_PER_PAGE = 12

  console.log('AssetsModule rendered with tbaAddress:', tbaAddress, 'selectedChain:', selectedChain)

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      if (isEnsurance) {
        const promises = Object.entries(ensuranceContracts).map(([chain, contract]) => 
          axios.get(`/api/simplehash/ensurance?chain=${chain}&contractAddress=${contract}`)
        );

        const responses = await Promise.all(promises);
        const allNfts = responses.flatMap(response => response.data);
        setAssets(allNfts);
      } else {
        const response = await axios.get(`/api/simplehash/nft?tbaAddress=${tbaAddress}`);
        setAssets(response.data);
      }
    } catch (error) {
      console.error(`Error in fetchAssets:`, error);
    } finally {
      setLoading(false);
    }
  }, [tbaAddress, isEnsurance]);

  useEffect(() => {
    console.log('fetchAssets effect triggered');
    fetchAssets();
  }, [fetchAssets]);

  // Update the filtering logic
  useEffect(() => {
    if (!searchQuery) {
      setDisplayedAssets(assets.slice(0, ITEMS_PER_PAGE));
      setHasMore(assets.length > ITEMS_PER_PAGE);
      return;
    }

    const searchLower = searchQuery.toLowerCase();
    const filtered = assets.filter(asset => {
      const tokenIdMatch = asset.token_id?.toLowerCase().includes(searchLower);
      const nameMatch = asset.name ? asset.name.toLowerCase().includes(searchLower) : false;
      const descriptionMatch = asset.description ? asset.description.toLowerCase().includes(searchLower) : false;
      return tokenIdMatch || nameMatch || descriptionMatch;
    });

    setDisplayedAssets(filtered.slice(0, ITEMS_PER_PAGE));
    setHasMore(filtered.length > ITEMS_PER_PAGE);
  }, [assets, searchQuery]);

  // Update fetchMoreData with the same filtering logic
  const fetchMoreData = () => {
    if (!searchQuery) {
      const currentLength = displayedAssets.length;
      const more = assets.slice(currentLength, currentLength + ITEMS_PER_PAGE);
      setDisplayedAssets(prev => [...prev, ...more]);
      setHasMore(currentLength + ITEMS_PER_PAGE < assets.length);
      return;
    }

    const searchLower = searchQuery.toLowerCase();
    const filtered = assets.filter(asset => {
      const tokenIdMatch = asset.token_id?.toLowerCase().includes(searchLower);
      const nameMatch = asset.name ? asset.name.toLowerCase().includes(searchLower) : false;
      const descriptionMatch = asset.description ? asset.description.toLowerCase().includes(searchLower) : false;
      return tokenIdMatch || nameMatch || descriptionMatch;
    });

    const currentLength = displayedAssets.length;
    const more = filtered.slice(currentLength, currentLength + ITEMS_PER_PAGE);
    setDisplayedAssets(prev => [...prev, ...more]);
    setHasMore(currentLength + ITEMS_PER_PAGE < filtered.length);
  };

  const filteredAssets = selectedChain === 'all'
    ? displayedAssets
    : displayedAssets.filter(asset => asset.chain === selectedChain)

  return (
    <div className="bg-transparent">
      <AssetSearch 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        placeholder={`Search ${isEnsurance ? 'ensurance' : ''} assets...`}
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <Card key={`skeleton-${index}`}>
              <CardContent className="p-4">
                <Skeleton className="h-48 w-full mb-4" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredAssets.length > 0 ? (
        <InfiniteScroll
          dataLength={filteredAssets.length}
          next={fetchMoreData}
          hasMore={hasMore}
          loader={<h4>Loading...</h4>}
          endMessage={
            <p className="text-center text-gray-500 mt-4">
              No more assets to load.
            </p>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-fr">
            {filteredAssets.map((asset) => (
              <AssetCard 
                key={asset.nft_id} 
                asset={asset} 
                tbaAddress={tbaAddress} 
              />
            ))}
          </div>
        </InfiniteScroll>
      ) : (
        <div className="text-center py-8">
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {selectedChain === 'all'
              ? `No ${isEnsurance ? 'ensurance' : ''} assets found${searchQuery ? ' matching your search' : ''}.`
              : `No ${isEnsurance ? 'ensurance' : ''} assets found for the selected chain (${selectedChain})${searchQuery ? ' matching your search' : ''}.`}
          </p>
        </div>
      )}
    </div>
  )
}
