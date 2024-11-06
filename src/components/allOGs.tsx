'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { OG } from '@/types'
import { getOGs } from '@/config/og'
import Link from 'next/link'
import Image from 'next/image'
import { AssetSearch } from '@/modules/assets/AssetSearch'

interface AllOGsProps {
  searchQuery?: string;
  setSearchQuery: (query: string) => void;
}

export default function AllOGs({ searchQuery = '', setSearchQuery }: AllOGsProps) {
  const [ogs, setOgs] = useState<OG[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOGs() {
      try {
        setLoading(true)
        const OGs = await getOGs()
        console.log('Fetched OGs:', OGs)
        setOgs(OGs)
        console.log('OGs state set:', OGs) // Add this line
      } catch (err) {
        setError('Failed to fetch OGs')
        console.error('Error fetching OGs:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOGs()
  }, [])

  useEffect(() => {
    console.log('OGs in AllOGs component:', ogs);
  }, [ogs]);

  const getOrbPath = (ogName: string) => {
    return `/ogs/orbs/${ogName.replace(/^\./, '')}-orb.png`
  }

  const filteredOGs = useMemo(() => {
    if (!ogs || !searchQuery) return ogs || [];
    
    return ogs.filter(og => {
      const ogName = og.og_name.toLowerCase();
      const query = searchQuery.toLowerCase();
      return ogName.includes(query);
    });
  }, [ogs, searchQuery]);

  return (
    <div className="bg-background dark:bg-background-dark text-foreground dark:text-foreground-dark p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <h2 id="local-is-global" className="text-5xl font-mono font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
          Local Is Global
        </h2>
        <p className="text-xl text-center mb-8 max-w-3xl mx-auto">
          These 14 groups with over 600 members are taking systemic risk head on by investing in natural assets and societal well-being.
        </p>

        {searchQuery !== undefined && (
          <div className="mb-8">
            <AssetSearch 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              placeholder="Search groups..."
            />
          </div>
        )}

        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && filteredOGs.length === 0 && <p>No OGs found.</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredOGs.map((og) => (
            <Link
              key={og.contract_address}
              href={`/${og.og_name.replace(/^\./, '')}`}
              className="bg-primary dark:bg-primary-dark hover:bg-primary-dark dark:hover:bg-primary text-primary-foreground dark:text-primary-dark-foreground font-bold py-4 px-6 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 flex items-center"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden mr-4 flex-shrink-0 flex items-center justify-center">
                <Image
                  src={getOrbPath(og.og_name)}
                  alt={`${og.og_name} orb`}
                  width={40}
                  height={40}
                  className="object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
              <span className="text-lg">{og.og_name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
