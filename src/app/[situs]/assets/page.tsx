import { ReactNode } from 'react';

interface PageProps {
  params: { situs: string }
}

export default function AssetsPage({ params }: PageProps): ReactNode {
  return (
    <div>
      <h1>{params.situs} OG</h1>
      {/* Add more situs-specific content here */}
      // can add situs specific content here dynamically using a function to fetch the situs data
    </div>
  );
}