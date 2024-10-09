'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useOG } from '@/contexts/og-context'
import { OG } from '@/types/index'

interface NavItem {
  label: string;
  path: string;
}

interface SubNavigationProps {
  items: NavItem[];
}

export function SubNavigation({ items }: SubNavigationProps) {
  const { currentOG } = useOG()
  const pathname = usePathname()

  if (!currentOG) return null

  const ogPath = currentOG.replace(/^\./, '')

  return (
    <nav className="flex justify-center mb-8">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <ul className="flex">
          {items.map((item, index) => {
            const fullPath = `/${ogPath}/accounts${item.path}`
            const isActive = pathname === fullPath
            return (
              <li key={index} className="relative">
                <Link 
                  href={fullPath}
                  className={`
                    block px-6 py-3 text-sm font-medium transition-colors duration-200
                    ${isActive 
                      ? 'text-primary bg-primary/10' 
                      : 'text-gray-600 hover:text-primary hover:bg-primary/5'
                    }
                  `}
                >
                  {item.label}
                </Link>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
