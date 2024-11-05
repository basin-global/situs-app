'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'

export function AccountsSubNavigation() {
  const { og } = useParams()
  const pathname = usePathname()

  const isActive = (path: string) => pathname.includes(path)

  return (
    <nav className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
      <ul className="flex space-x-1 p-1">
        <li>
          <Link 
            href={`/${og}/accounts/all`} 
            className={`px-4 py-2 rounded-md transition-colors duration-200 ${
              isActive('/accounts/all') 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            ALL
          </Link>
        </li>
        <li>
          <Link 
            href={`/${og}/accounts/create`} 
            className={`px-4 py-2 rounded-md transition-colors duration-200 ${
              isActive('/accounts/create') 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            CREATE
          </Link>
        </li>
        <li>
          <Link 
            href={`/${og}/accounts/mine`} 
            className={`px-4 py-2 rounded-md transition-colors duration-200 ${
              isActive('/accounts/mine') 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            MINE
          </Link>
        </li>
      </ul>
    </nav>
  )
}