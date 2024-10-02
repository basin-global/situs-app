'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { fetchNFTsByContract, NFT } from '@/utils/simplehash'
import { useSitus } from '@/contexts/situs-context'
import { Input } from '@/components/ui/input'
import debounce from 'lodash/debounce'
import { AccountsNavigation } from '@/components/accounts-navigation'
import ErrorBoundary from '@/components/ErrorBoundary';

const ITEMS_PER_PAGE = 40

export default function AllAccountsPageWrapper({ params }: { params: { situs: string } }) {
  return (
    <ErrorBoundary>
      <AllAccountsPage params={params} />
    </ErrorBoundary>
  );
}

function AllAccountsPage({ params }: { params: { situs: string } }) {
  console.log('AllAccountsPage rendered with situs:', params.situs);
  const router = useRouter()
  const searchParams = useSearchParams()
  const { currentSitus, setCurrentSitus, getOGByName } = useSitus()
  const [cursor, setCursor] = useState<string | undefined>(undefined)
  const [nfts, setNfts] = useState<NFT[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm)
  const [hasMore, setHasMore] = useState(true)
  const [initialFetchDone, setInitialFetchDone] = useState(false)

  const [situsOG, setSitusOG] = useState<any>(null)

  useEffect(() => {
    if (params.situs !== currentSitus) {
      setCurrentSitus(params.situs);
    }
  }, [params.situs, currentSitus, setCurrentSitus]);

  useEffect(() => {
    async function loadSitusOG() {
      try {
        console.log('Loading Situs OG for:', currentSitus);
        const og = await getOGByName(currentSitus || '');
        if (!og) {
          console.error('No Situs OG found for:', currentSitus);
          setErrorMessage(`No Situs OG found for: ${currentSitus}`);
        } else {
          console.log('Loaded Situs OG:', og);
          setSitusOG(og);
        }
      } catch (error) {
        console.error('Error loading SitusOG:', error);
        setErrorMessage(`Failed to load Situs OG information: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    if (currentSitus) {
      loadSitusOG();
    }
  }, [currentSitus, getOGByName]);

  const fetchNFTs = useCallback(async () => {
    if (isLoading || !situsOG) return;
    setIsLoading(true)
    try {
      console.log('Fetching NFTs for contract:', situsOG.contractAddress);
      const result = await fetchNFTsByContract(situsOG.contractAddress, cursor, ITEMS_PER_PAGE)
      console.log('Fetched NFTs:', result.nfts.length);
      setNfts(prev => [...prev, ...result.nfts])
      setCursor(result.next_cursor || undefined)
      setHasMore(!!result.next_cursor)
    } catch (error) {
      console.error('Error fetching NFTs:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred')
    } finally {
      setIsLoading(false)
      setInitialFetchDone(true)
    }
  }, [cursor, isLoading, situsOG])

  useEffect(() => {
    if (!initialFetchDone && situsOG) {
      fetchNFTs();
    }
  }, [fetchNFTs, initialFetchDone, situsOG]);

  const filteredNFTs = useMemo(() => {
    return nfts.filter(nft => 
      nft.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      nft.id.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    )
  }, [nfts, debouncedSearchTerm])

  const debouncedSearch = useCallback(
    debounce((search: string) => {
      setDebouncedSearchTerm(search)
      router.push(`/${params.situs}/accounts/all?search=${encodeURIComponent(search)}`, { scroll: false })
    }, 300),
    [params.situs, router]
  )

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    debouncedSearch(value)
  }

  const clearSearch = () => {
    setSearchTerm('')
    setDebouncedSearchTerm('')
    debouncedSearch('')
  }

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchNFTs()
    }
  }, [fetchNFTs, isLoading, hasMore])

  if (!situsOG) return <div>Loading Situs OG information...</div>
  if (errorMessage) return <div>Failed to load NFTs: {errorMessage}</div>

  const NFTGrid = ({ nfts }: { nfts: NFT[] }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {nfts.map((nft) => {
        const tokenName = nft.name.toLowerCase().split('.')[0]; // Take only the part before the dot
        return (
          <Link 
            key={`${nft.contract_address}-${nft.id}`} 
            href={`/${params.situs}/accounts/${nft.id}/${tokenName}`}
          >
            <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
              <div className="relative w-full h-48 mb-2">
                {nft.image ? (
                  <Image
                    src={nft.image}
                    alt={nft.name}
                    layout="fill"
                    objectFit="cover"
                    className="rounded"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded">
                    <span className="text-gray-500">No image available</span>
                  </div>
                )}
              </div>
              <h3 className="text-lg font-semibold">{nft.name}</h3>
              <p className="text-sm text-gray-500">ID: {nft.id}</p>
            </div>
          </Link>
        );
      })}
    </div>
  )

  return (
    <div>
      <AccountsNavigation />
      <h1 className="text-2xl font-bold mb-4">All {situsOG?.name} OG Accounts</h1>
      <div className="relative">
        <Input
          type="text"
          placeholder="Search NFTs by name or ID..."
          onChange={handleSearchChange}
          value={searchTerm}
          className="w-full p-2 pr-8 mb-4 border rounded"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        )}
      </div>
      {!initialFetchDone || isLoading && nfts.length === 0 ? (
        <p>Loading NFTs...</p>
      ) : filteredNFTs.length > 0 ? (
        <NFTGrid nfts={filteredNFTs} />
      ) : (
        <p>No NFTs found for this contract.</p>
      )}
      {hasMore && (
        <button 
          onClick={loadMore} 
          disabled={isLoading}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
        >
          {isLoading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  )
}