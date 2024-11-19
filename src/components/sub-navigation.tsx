'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'

interface SubNavigationProps {
  type?: 'accounts' | 'ensurance' | 'currency';
}

export function SubNavigation({ type = 'accounts' }: SubNavigationProps) {
  const { og } = useParams()
  const pathname = usePathname()

  const isActive = (path: string) => pathname.includes(path)

  const getLinks = () => {
    if (type === 'accounts') {
      return [
        { href: `/${og}/accounts/all`, label: 'ALL' },
        { href: `/${og}/accounts/create`, label: 'CREATE' },
        { href: `/${og}/accounts/mine`, label: 'MINE' }
      ]
    }

    if (type === 'ensurance') {
      return [
        { href: `/${og}/ensurance/all`, label: 'ALL' },
        { href: `/${og}/ensurance/create`, label: 'CREATE' },
        { href: `/${og}/ensurance/mine`, label: 'MINE' }
      ]
    }

    return [
      { href: `/${og}/currency/all`, label: 'ALL' },
      { href: `/${og}/currency/swap`, label: 'SWAP' },
      { href: `/${og}/currency/mine`, label: 'MINE' }
    ]
  }

  const links = getLinks()

  return (
    <nav className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
      <ul className="flex space-x-1 p-1">
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link 
              href={href} 
              className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                isActive(href) 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}