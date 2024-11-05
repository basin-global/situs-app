import React from 'react';

const AnnouncementBanner: React.FC = () => {
  return (
    <div className="bg-yellow-100 text-gray-700 text-sm py-1 px-4 text-center">
      🚧 BETA MODE - there may be bugs - please <a href="mailto:tmo@basin.global" className="underline hover:text-gray-900">report</a> 🚧
    </div>
  );
};

export default AnnouncementBanner;
