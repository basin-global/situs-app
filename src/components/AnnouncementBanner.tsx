'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AnnouncementBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const lastDismissed = localStorage.getItem('betaBannerDismissed');
    const shownThisSession = sessionStorage.getItem('betaBannerShownThisSession');
    
    const shouldShow = !lastDismissed || 
      (Date.now() - parseInt(lastDismissed)) > 7 * 24 * 60 * 60 * 1000 ||
      (!shownThisSession && !lastDismissed);
    
    if (shouldShow) {
      setIsVisible(true);
      sessionStorage.setItem('betaBannerShownThisSession', 'true');
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('betaBannerDismissed', Date.now().toString());
    sessionStorage.removeItem('betaBannerShownThisSession');
  };

  if (!isVisible) return null;

  return (
    <div className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700/50">
      <div className="max-w-7xl mx-auto py-1 px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap">
          <div className="w-0 flex-1 flex items-center justify-center">
            <p className="text-xs text-gray-300 text-center">
              <span className="inline-flex items-center">
                <span className="mr-1">⚡️</span>
                <span>YOU'RE EARLY - please</span>
                <Link
                  href="https://x.com/ensitus_xyz"
                  className="ml-1 font-medium text-amber-400 hover:text-amber-300 transition-colors underline-offset-4 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  report any bugs
                </Link>
                <span className="ml-1">⚡️</span>
              </span>
            </p>
          </div>
          <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-3">
            <button
              type="button"
              onClick={handleDismiss}
              className="-mr-1 flex p-1 rounded-md hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-gray-600 transition-colors"
            >
              <span className="sr-only">Dismiss</span>
              <svg 
                className="h-3 w-3 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
