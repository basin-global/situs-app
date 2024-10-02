'use client'

import { useEffect, useState } from 'react'
import { SitusOG } from '@/types/situs'
import { getSitusOGs } from '@/config/situs'
import Link from 'next/link'

export default function AllOGs() {
  const [ogs, setOgs] = useState<SitusOG[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOGs() {
      try {
        setLoading(true)
        const situsOGs = await getSitusOGs()
        console.log('Fetched OGs:', situsOGs)
        setOgs(situsOGs)
      } catch (err) {
        setError('Failed to fetch OGs')
        console.error('Error fetching OGs:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOGs()
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Situs OG's</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && ogs.length === 0 && <p>No OGs found.</p>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {ogs.map((og) => (
          <Link
            key={og.contract_address}
            href={`/${og.og_name.replace(/^\./, '')}`}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 flex items-center justify-center text-center"
          >
            {og.og_name}
          </Link>
        ))}
      </div>
    </div>
  )
}
