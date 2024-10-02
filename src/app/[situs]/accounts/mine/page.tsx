'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { fetchNFTsForOwner, NFT } from '@/utils/simplehash'
import { useSitus } from '@/contexts/situs-context'
import { Input } from '@/components/ui/input'
import debounce from 'lodash/debounce'
import { usePrivy } from '@privy-io/react-auth'

const ITEMS_PER_PAGE = 40

export default function MyAccountsPage({ params }: { params: { situs: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, login, authenticated } = usePrivy()
  const situs = params.situs as string
  const { getOGByName } = useSitus()
  const [cursor, setCursor] = useState<string | undefined>(undefined)
  const [nfts, setNfts] = useState<NFT[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm)
  const [hasMore, setHasMore] = useState(true)
  const [noAccountsFound, setNoAccountsFound] = useState(false)
  const [initialFetchDone, setInitialFetchDone] = useState(false)
  const [situsOG, setSitusOG] = useState<any>(null)

  useEffect(() => {
    async function loadSitusOG() {
      try {
        const og = await getOGByName(situs)
        setSitusOG(og)
      } catch (error) {
        console.error('Error loading SitusOG:', error)
        setErrorMessage('Failed to load Situs OG information')
      }
    }
    loadSitusOG()
  }, [situs, getOGByName])

  const fetchNFTs = useCallback(async () => {
    if (isLoading || !authenticated || !user?.wallet?.address || !situsOG) return;
    setIsLoading(true)
    try {
      console.log('Fetching NFTs for wallet:', user.wallet.address);
      const result = await fetchNFTsForOwner(user.wallet.address, cursor)
      console.log('Fetched NFTs:', result.nfts.length);
      const ogNFTs = result.nfts.filter(nft => nft.contract_address.toLowerCase() === situsOG.contractAddress.toLowerCase())
      setNfts(prev => [...prev, ...ogNFTs.filter(nft => !prev.some(p => p.id === nft.id))])
      setCursor(result.next_cursor || undefined)
      setHasMore(!!result.next_cursor)
      
      if (ogNFTs.length === 0 && nfts.length === 0 && !result.next_cursor) {
        setTimeout(() => {
          setNoAccountsFound(true)
        }, 2000)
      } else {
        setNoAccountsFound(false)
      }
    } catch (error) {
      console.error('Error fetching NFTs:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred')
    } finally {
      setIsLoading(false)
      setInitialFetchDone(true)
    }
  }, [authenticated, user?.wallet?.address, cursor, situsOG, nfts.length])

  useEffect(() => {
    if (authenticated && !initialFetchDone && situsOG) {
      fetchNFTs();
    }
  }, [authenticated, fetchNFTs, initialFetchDone, situsOG]);

  const filteredNFTs = useMemo(() => {
    return nfts.filter(nft => 
      nft.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      nft.id.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    )
  }, [nfts, debouncedSearchTerm])

  const debouncedSearch = useCallback(
    debounce((search: string) => {
      setDebouncedSearchTerm(search)
      router.push(`/${situs}/accounts/mine?search=${encodeURIComponent(search)}`, { scroll: false })
    }, 300),
    [situs, router]
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

  const handleRecheck = () => {
    setNfts([])
    setCursor(undefined)
    setHasMore(true)
    fetchNFTs()
  }

  if (!authenticated) return <button onClick={login}>Connect Wallet</button>
  if (!situsOG) return <div>Loading Situs OG information...</div>
  if (errorMessage) return <div>Error: {errorMessage}</div>

  const NFTGrid = ({ nfts }: { nfts: NFT[] }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {nfts.slice(0, ITEMS_PER_PAGE).map((nft) => {
        const tokenName = nft.name.toLowerCase().split('.')[0];
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
      <h1 className="text-2xl font-bold mb-4">My {situsOG?.name} OG Accounts</h1>
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
      {!initialFetchDone || isLoading ? (
        <p>Loading NFTs...</p>
      ) : noAccountsFound ? (
        <div className="text-center">
          <p className="text-lg mb-4">No accounts found.</p>
          <button 
            onClick={handleRecheck}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Recheck
          </button>
        </div>
      ) : filteredNFTs.length > 0 ? (
        <NFTGrid nfts={filteredNFTs} />
      ) : (
        <p>No NFTs found for this contract.</p>
      )}
      {hasMore && !noAccountsFound && (
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