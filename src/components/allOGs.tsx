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
        const fetchedOGs = await getOGs()
        console.log('Raw fetched OGs:', fetchedOGs.length, fetchedOGs);
        
        // Log OGs with zero total_supply
        const zeroSupplyOGs = fetchedOGs.filter(og => !og.total_supply);
        if (zeroSupplyOGs.length > 0) {
          console.log('OGs with zero total_supply:', zeroSupplyOGs);
        }
        
        // Transform database rows into OG objects
        const transformedOGs: OG[] = fetchedOGs.map(row => {
          const transformed = {
            og_name: row.og_name,
            contract_address: row.contract_address,
            name: row.name_front || '',
            email: row.email || '',
            total_supply: row.total_supply || 0,
            tagline: row.tagline || '',
            description: row.description || '',
            website: row.website || '',
            chat: row.chat || '',
            group_ensurance: row.group_ensurance || false
          };
          return transformed;
        })
        
        console.log('Transformed OGs:', transformedOGs.length, transformedOGs);
        
        // Filter out OGs with no contract address
        const validOGs = transformedOGs.filter(og => og.contract_address);
        if (validOGs.length !== transformedOGs.length) {
          console.log('Filtered out OGs without contract address:', 
            transformedOGs.filter(og => !og.contract_address)
          );
        }
        
        setOgs(validOGs)
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
    console.log('OGs state updated:', ogs.length, ogs);
  }, [ogs]);

  const getOrbPath = (ogName: string) => {
    return `/ogs/orbs/${ogName.replace(/^\./, '')}-orb.png`
  }

  const filteredOGs = useMemo(() => {
    if (!ogs || !searchQuery) {
      console.log('Returning unfiltered OGs:', ogs?.length || 0);
      return ogs || [];
    }
    
    const filtered = ogs.filter(og => {
      const ogName = og.og_name.toLowerCase();
      const query = searchQuery.toLowerCase();
      return ogName.includes(query);
    });
    
    console.log('Filtered OGs:', filtered.length);
    return filtered;
  }, [ogs, searchQuery]);

  return (
    <div className="bg-background dark:bg-background-dark text-foreground dark:text-foreground-dark p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <h2 id="local-is-global" className="text-5xl font-mono font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
          Local Is Global
        </h2>
        <p className="text-xl text-center mb-8 max-w-3xl mx-auto">
          These {ogs.length} groups with over {ogs.reduce((acc, og) => acc + (og.total_supply || 0), 0)} members are taking systemic risk head on by investing in natural assets and societal well-being.
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
