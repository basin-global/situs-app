'use client'

import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSitus } from '@/contexts/situs-context'

export function AccountsNavigation() {
  const pathname = usePathname()
  const { currentSitus } = useSitus()

  const navItems = [
    { href: '/accounts/mine', label: 'Mine' },
    { href: '/accounts/create', label: 'Create' },
    { href: '/accounts/all', label: 'All' },
  ]

  return (
    <nav className="flex space-x-4 mb-6">
      {navItems.map((item) => {
        const fullHref = `/${currentSitus}${item.href}`
        const isActive = pathname === fullHref

        return (
          <Link key={item.href} href={fullHref} passHref>
            <Button
              variant={isActive ? "default" : "outline"}
              className={isActive ? "pointer-events-none" : ""}
            >
              {item.label}
            </Button>
          </Link>
        )
      })}
    </nav>
  )
}