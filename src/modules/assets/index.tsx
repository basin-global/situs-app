import React, { useEffect, useState, useCallback, useMemo } from 'react'
import axios from 'axios'
import AssetCard from './AssetCard'
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ensuranceContracts, isEnsuranceToken } from '@/modules/ensurance/config'
import InfiniteScroll from 'react-infinite-scroll-component'
import { AssetSearch } from './AssetSearch'
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { getChainBySimplehashName, getActiveChains } from '@/config/chains';
import { TokenboundClient } from "@tokenbound/sdk";
import { getTokenBoundClientConfig } from '@/config/tokenbound';
import { createTokenboundActions } from '@/lib/tokenbound';
import { fetchNFTsByContracts } from '@/lib/simplehash';
import { useOG } from '@/contexts/og-context';
import { getFeaturedTokensForOG } from '@/modules/ensurance/featured-config';

// Export the existing Asset interface
export interface Asset {
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
  queried_wallet_balances: Array<{
    address: string;
    first_acquired_date: string;
    last_acquired_date: string;
    quantity: number;
    quantity_string: string;
  }>;
  description?: string;
}

// Update TokenboundActions interface
export interface TokenboundActions {
  transferNFT: (asset: Asset, toAddress: `0x${string}`, amount?: number) => Promise<{ hash: string; isCrossChain?: boolean }>;
  isAccountDeployed: (asset: Asset) => Promise<boolean>;
}

interface AssetsModuleProps {
  address: string;
  selectedChain: string;
  isEnsuranceTab?: boolean;
  isTokenbound: boolean;
  isOwner?: boolean;
}

export default function AssetsModule({ 
  address,
  selectedChain,
  isEnsuranceTab,
  isTokenbound,
  isOwner = false,
}: AssetsModuleProps) {
  const { wallets } = useWallets();
  const { currentOG } = useOG();
  const activeWallet = wallets[0];
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [allChainsData, setAllChainsData] = useState<Record<string, Asset[]>>({});
  const [displayedChains, setDisplayedChains] = useState<string[]>([]);
  const [ownedNFTs, setOwnedNFTs] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const CHAINS_PER_LOAD = 2;

  console.log('AssetsModule rendered with address:', address, 'selectedChain:', selectedChain)

  // Get available chains based on tab
  const availableChains = isEnsuranceTab 
    ? Object.keys(ensuranceContracts)
    : getActiveChains().map(c => c.simplehashName);

  const fetchAssets = useCallback(async () => {
    console.log('=== fetchAssets START ===', {
      address,
      selectedChain,
      isEnsuranceTab,
      isTokenbound
    });

    setLoading(true);
    setAssets([]);
    try {
      if (selectedChain === 'all') {
        if (isEnsuranceTab) {
          // Fetch all ensurance contracts data first
          const ensuranceResults = await Promise.all(
            Object.entries(ensuranceContracts).map(async ([chain, contractAddress]) => {
              const nfts = await fetchNFTsByContracts(address, { [chain]: contractAddress });
              return { chain, nfts };
            })
          );

          // Get ownership data once
          const ownedResponse = await axios.get(`/api/simplehash/nft?address=${address}&fetchAll=true`);
          setOwnedNFTs(ownedResponse.data.nfts || []);

          // Store data by chain
          const chainData: Record<string, Asset[]> = {};
          ensuranceResults.forEach(({ chain, nfts }) => {
            chainData[chain] = nfts;
          });

          setAllChainsData(chainData);
          // Start with first chain
          setDisplayedChains([Object.keys(chainData)[0]]);
        } else {
          // For assets tab: Get all owned NFTs in one call
          const response = await axios.get(`/api/simplehash/nft?address=${address}&fetchAll=true`);
          const nfts = response.data.nfts || [];
          setCursor(response.data.next);

          // Group by chain
          const chainData: Record<string, Asset[]> = {};
          nfts.forEach((nft: Asset) => {
            if (!chainData[nft.chain]) chainData[nft.chain] = [];
            chainData[nft.chain].push(nft);
          });

          setAllChainsData(chainData);
          // Start with first chain
          setDisplayedChains([Object.keys(chainData)[0]]);
        }
      } else {
        // Single chain fetch
        console.log('Fetching single chain:', selectedChain);
        
        if (isEnsuranceTab) {
          // First get all ensurance NFTs for this chain
          const nfts = await fetchNFTsByContracts(
            address, 
            { [selectedChain]: ensuranceContracts[selectedChain as keyof typeof ensuranceContracts] }
          );
          
          console.log('Ensurance NFTs:', {
            chain: selectedChain,
            count: nfts.length
          });

          // Then get ownership data
          const ownedNFTsResponse = await axios.get(`/api/simplehash/nft`, {
            params: { 
              address,
              chain: selectedChain,
              fetchAll: true 
            }
          });

          console.log('Ownership data:', {
            totalOwned: ownedNFTsResponse.data.nfts?.length || 0
          });

          // Add ownership data to NFTs
          const nftsWithOwnership = nfts.map(nft => ({
            ...nft,
            queried_wallet_balances: ownedNFTsResponse.data.nfts?.find((owned: any) => 
              owned.contract_address.toLowerCase() === nft.contract_address.toLowerCase() &&
              owned.token_id === nft.token_id &&
              owned.chain === nft.chain
            )?.queried_wallet_balances || []
          }));

          console.log('Final NFTs with ownership:', {
            total: nftsWithOwnership.length,
            withBalances: nftsWithOwnership.filter(nft => nft.queried_wallet_balances.length > 0).length
          });

          setAssets(nftsWithOwnership);
        } else {
          // Regular assets tab fetch
          const response = await axios.get(`/api/simplehash/nft?address=${address}&chain=${selectedChain}`);
          setAssets(response.data.nfts || []);
        }
      }
    } catch (error) {
      console.error(`Error in fetchAssets:`, error);
    } finally {
      setLoading(false);
    }
  }, [address, selectedChain, isEnsuranceTab, isTokenbound]);

  // Initial fetch when component mounts or key props change
  useEffect(() => {
    console.log('Initial fetch triggered');
    fetchAssets();
  }, [fetchAssets]);

  // Load more chains when scrolling
  const loadMoreChains = useCallback(() => {
    if (selectedChain !== 'all') return;

    const availableChains = Object.keys(allChainsData);
    const nextChains = availableChains
      .filter(chain => !displayedChains.includes(chain))
      .slice(0, CHAINS_PER_LOAD);

    if (nextChains.length > 0) {
      setDisplayedChains(prev => [...prev, ...nextChains]);
    }
  }, [allChainsData, displayedChains, selectedChain]);

  // Get combined assets from displayed chains
  const displayedAssets = useMemo(() => {
    if (selectedChain === 'all') {
      return displayedChains.flatMap(chain => {
        const chainAssets = allChainsData[chain] || [];
        if (isEnsuranceTab) {
          // Add ownership data for ensurance NFTs
          return chainAssets.map(nft => ({
            ...nft,
            queried_wallet_balances: ownedNFTs.find((owned: any) => 
              owned.contract_address.toLowerCase() === nft.contract_address.toLowerCase() &&
              owned.token_id === nft.token_id &&
              owned.chain === nft.chain
            )?.queried_wallet_balances || []
          }));
        }
        return chainAssets;
      });
    }
    return assets;
  }, [selectedChain, displayedChains, allChainsData, assets, isEnsuranceTab, ownedNFTs]);

  // Filter displayed assets based on search query
  const filteredAssets = useMemo(() => {
    return displayedAssets.filter(asset => {
      const searchLower = searchQuery.toLowerCase();
      return (
        asset.name?.toLowerCase().includes(searchLower) ||
        asset.collection?.name?.toLowerCase().includes(searchLower) ||
        asset.token_id.toLowerCase().includes(searchLower)
      );
    });
  }, [displayedAssets, searchQuery]);

  // Only create tokenbound actions if isTokenbound is true
  const tokenbound = isTokenbound 
    ? createTokenboundActions(activeWallet, address) 
    : null;

  console.log('AssetsModule - Rendering with:', {
    selectedChain,
    assetsCount: assets.length,
    loading
  });

  return (
    <div className="bg-transparent">
      <AssetSearch 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        placeholder={`Search ${isEnsuranceTab ? 'ensurance' : ''} assets...`}
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
          next={loadMoreChains}
          hasMore={selectedChain === 'all' && displayedChains.length < Object.keys(allChainsData).length}
          loader={
            <div className="text-center py-4">
              Loading next chains... ({displayedChains.length}/{Object.keys(allChainsData).length})
            </div>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-fr">
            {filteredAssets.map((asset) => {
              const isFeatured = isEnsuranceTab && currentOG?.og_name 
                ? getFeaturedTokensForOG(currentOG.og_name).some(token => {
                    return token.chain.toLowerCase() === asset.chain.toLowerCase() && 
                           Number(token.tokenId) === Number(asset.token_id);
                  })
                : false;

              return (
                <AssetCard 
                  key={asset.nft_id} 
                  asset={asset} 
                  address={address}
                  isEnsuranceTab={isEnsuranceTab}
                  isTokenbound={isTokenbound}
                  isOwner={isOwner}
                  isFeatured={isFeatured}
                />
              );
            })}
          </div>
        </InfiniteScroll>
      ) : (
        <div className="text-center py-8">
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {selectedChain === 'all'
              ? `No ${isEnsuranceTab ? 'ensurance' : ''} assets found${searchQuery ? ' matching your search' : ''}.`
              : `No ${isEnsuranceTab ? 'ensurance' : ''} assets found for the selected chain (${selectedChain})${searchQuery ? ' matching your search' : ''}.`}
          </p>
        </div>
      )}
    </div>
  )
}
