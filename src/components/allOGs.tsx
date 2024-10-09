'use client'

import { useEffect, useState } from 'react'
import { OG } from '@/types/situs'
import { getOGs } from '@/config/og'
import Link from 'next/link'
import Image from 'next/image'

export default function AllOGs() {
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
      } catch (err) {
        setError('Failed to fetch OGs')
        console.error('Error fetching OGs:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOGs()
  }, [])

  const getOrbPath = (ogName: string) => {
    return `/ogs/orbs/${ogName.replace(/^\./, '')}-orb.png`
  }

  return (
    <div className="bg-background dark:bg-background-dark text-foreground dark:text-foreground-dark p-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl font-mono font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
          Local Is Global
        </h2>
        <p className="text-xl text-center mb-12 max-w-3xl mx-auto">
        These groups are taking systemic risk head on by investing in natural assets and societal well-being.
        </p>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && ogs.length === 0 && <p>No OGs found.</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {ogs.map((og) => (
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
