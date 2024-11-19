'use client';

import { usePathname } from 'next/navigation';

const AnnouncementBanner: React.FC = () => {
  const pathname = usePathname();
  const isMetadataRoute = pathname.startsWith('/metadata/');

  if (isMetadataRoute) return null;

  return (
    <div className="bg-yellow-100 text-gray-700 text-sm py-1 px-4 text-center">
      🚧 BETA MODE - there may be bugs - please <a href="mailto:tmo@basin.global" className="underline hover:text-gray-900">report</a> 🚧
    </div>
  );
};

export default AnnouncementBanner;
