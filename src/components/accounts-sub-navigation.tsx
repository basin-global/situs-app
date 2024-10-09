'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'

export function AccountsSubNavigation() {
  const { og } = useParams()

  return (
    <nav className="mb-4">
      <ul className="flex space-x-4">
        <li>
          <Link href={`/${og}/accounts/all`} className="text-blue-500 hover:text-blue-700">
            All Accounts
          </Link>
        </li>
        <li>
          <Link href={`/${og}/accounts/create`} className="text-blue-500 hover:text-blue-700">
            Create Account
          </Link>
        </li>
      </ul>
    </nav>
  )
}