'use client';

import { SubNavigation } from '@/components/sub-navigation';
import { useOG } from '@/contexts/og-context';

export default function MyEnsurancePage() {
  const { currentOG } = useOG();

  if (!currentOG) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="mb-4 flex justify-center">
        <SubNavigation type="ensurance" />
      </div>

      <h2 className="text-5xl font-mono font-bold mb-4 text-center">
        My{' '}
        <span className="bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-500 text-transparent bg-clip-text">
          Certificates
        </span>
      </h2>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Your ensured assets will show here.
        </p>
      </div>
    </div>
  );
} 