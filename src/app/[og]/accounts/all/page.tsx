'use client'

import { useOG } from '@/contexts/og-context'
import AllAccounts from '@/components/allAccounts'
import { AccountsSubNavigation } from '@/components/accounts-sub-navigation'

export default function AllAccountsPage() {
  const { currentOG } = useOG()

  if (!currentOG) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AccountsSubNavigation />
      <AllAccounts og={currentOG.og_name.replace(/^\./, '')} />
    </div>
  )
}
