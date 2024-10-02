'use client'

// AccountsNavigation Component
// This component renders a navigation menu for account-related pages within a Situs OG.
// It displays links for Accounts, My Accounts, Create Account, and All Accounts.
// The component highlights the current active page and uses the current Situs context for generating links.

import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSitus } from '@/contexts/situs-context'

export function AccountsNavigation() {
  const pathname = usePathname()
  const { currentSitus } = useSitus()

  const navItems = [
    { href: 'accounts/mine', label: 'My Accounts' },
    { href: 'accounts/create', label: 'Create Account' },
    { href: 'accounts/all', label: 'All Accounts' },
  ]

  return (
    <nav className="flex flex-col space-y-2">
      {navItems.map((item) => (
        <Link 
          key={item.href} 
          href={`/${currentSitus}/${item.href}`}
          passHref
        >
          <Button 
            variant="ghost" 
            className={`w-full justify-start ${pathname.includes(item.href) ? 'bg-accent text-accent-foreground' : ''}`}
          >
            {item.label}
          </Button>
        </Link>
      ))}
    </nav>
  );
}