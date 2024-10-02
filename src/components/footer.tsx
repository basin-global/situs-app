'use client'

import Link from 'next/link'
import { usePrivy } from '@privy-io/react-auth'

export default function Footer() {
  const { authenticated } = usePrivy()

  return (
    <footer className="bg-[#121212] text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center space-y-6">
          <div className="flex space-x-4 items-center">
            <Link href="/" className="text-white hover:text-yellow-300 transition-colors duration-300">
              Home
            </Link>
            {authenticated && (
              <Link href="/profile" className="text-white hover:text-yellow-300 transition-colors duration-300">
                Profile
              </Link>
            )}
          </div>
          <div className="w-full max-w-4xl">
          </div>
        </div>
      </div>
    </footer>
  )
}