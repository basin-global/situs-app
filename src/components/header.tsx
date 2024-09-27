'use client'

import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, FileText, Coins } from "lucide-react"
import Link from 'next/link'
import { usePrivy } from '@privy-io/react-auth'
import { SitusChooser } from './situs-chooser'
import { usePathname } from 'next/navigation'
import { useSitus } from '@/contexts/situs-context'
import SitusOGAbi from "@/src/abi/SitusOG.json";

export function Header() {
  const { login, authenticated, user, logout } = usePrivy()
  const pathname = usePathname()
  const { currentSitus } = useSitus()

  const displayName = user?.wallet?.address 
    ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`
    : 'User'

  const isHomePage = pathname === '/'
  const isProfilePage = pathname === '/profile'
  const showSitusChooser = !isHomePage && !isProfilePage

  const navItems = [
    { href: '/accounts', icon: Users, label: 'Accounts' },
    { href: '/certificates', icon: FileText, label: 'Certificates' },
    { href: '/currency', icon: Coins, label: 'Currency' },
  ]

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <Link href="/" className="flex items-center space-x-4">
            <LayoutDashboard className="h-8 w-8" />
            <span className="text-xl font-bold">Situs Protocol</span>
          </Link>
          <div className="flex items-center space-x-4">
            {showSitusChooser && <SitusChooser />}
            {authenticated ? (
              <div className="flex items-center space-x-4">
                <Link href="/profile" className="hover:underline">
                  {displayName}
                </Link>
                <Button variant="outline" onClick={() => logout()}>Logout</Button>
              </div>
            ) : (
              <Button variant="outline" onClick={() => login()}>Login</Button>
            )}
          </div>
        </div>
        {authenticated && currentSitus && !isProfilePage && (
          <nav className="flex space-x-4">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={`/${currentSitus}${item.href}`}
                className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}