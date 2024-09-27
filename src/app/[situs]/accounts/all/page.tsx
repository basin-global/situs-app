'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { fetchNFTsByContract, NFT } from '@/utils/simplehash'
import { getSitusOGByName } from '@/config/situs'
import { Input } from '@/components/ui/input'
import debounce from 'lodash/debounce'
import { AccountsNavigation } from '@/components/accounts-navigation'

const ITEMS_PER_PAGE = 40

export default function AllAccountsPage({ params }: { params: { situs: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const situs = params.situs as string
  const [cursor, setCursor] = useState<string | undefined>(undefined)
  const [nfts, setNfts] = useState<NFT[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm)
  const [hasMore, setHasMore] = useState(true)

  const situsOG = getSitusOGByName(params.situs)

  if (!situsOG) {
    return <div>Invalid situs specified.</div>
  }

  const fetchNFTs = useCallback(async () => {
    if (isLoading || !situsOG) return;
    setIsLoading(true)
    try {
      console.log('Fetching NFTs for contract:', situsOG.contractAddress);
      const result = await fetchNFTsByContract(situsOG.contractAddress, cursor, ITEMS_PER_PAGE)
      console.log('Fetched NFTs:', result.nfts.length);
      setNfts(prev => [...prev, ...result.nfts.filter((nft: NFT) => !prev.some(p => p.id === nft.id))])
      setCursor(result.next_cursor || undefined)
      setHasMore(!!result.next_cursor)
    } catch (error) {
      console.error('Error fetching NFTs:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [cursor, isLoading, situsOG])

  const filteredNFTs = useMemo(() => {
    return nfts.filter(nft => 
      nft.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      nft.id.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    )
  }, [nfts, debouncedSearchTerm])

  const debouncedSearch = useCallback(
    debounce((search: string) => {
      setDebouncedSearchTerm(search)
      router.push(`/${situs}/accounts/all?search=${encodeURIComponent(search)}`, { scroll: false })
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

  useEffect(() => {
    if (nfts.length === 0) {
      fetchNFTs();
    }
  }, [fetchNFTs, nfts.length]);

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
      {filteredNFTs.length > 0 ? (
        <NFTGrid nfts={filteredNFTs} />
      ) : (
        <p>{isLoading ? 'Loading NFTs...' : 'No NFTs found for this contract.'}</p>
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