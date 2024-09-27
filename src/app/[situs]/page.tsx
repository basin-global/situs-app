import { ReactNode } from 'react';

interface PageProps {
  params: { situs: string }
}

export default function SitusPage({ params }: PageProps): ReactNode {
  return (
    <div>
      <h1>{params.situs} Dashboard</h1>
      {/* Add more situs-specific content here */}
    </div>
  );
}