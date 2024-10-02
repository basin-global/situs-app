'use client'

// SitusContent Component
// This component renders content specific to a given Situs OG.
// It displays the name of the Situs OG and includes navigation for accounts.
// Additional Situs-specific content can be added within this component.

import { AccountsNavigation } from '@/components/accounts-navigation';

interface SitusContentProps {
  situs: string;
}

export default function SitusContent({ situs }: SitusContentProps) {
  return (
    <div>
      <h1>{situs} OG</h1>
      <AccountsNavigation />
      {/* Add more situs-specific content here */}
    </div>
  );
}