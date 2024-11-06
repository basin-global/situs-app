'use client';

import React from 'react';
import { useOG } from '@/contexts/og-context';
import { SubNavigation } from '@/components/sub-navigation';
import { Button } from "@/components/ui/button"
import Image from 'next/image';

export default function CreateEnsurancePage() {
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
        Create{' '}
        <span className="bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-500 text-transparent bg-clip-text">
          Certificate of Ensurance
        </span>
      </h2>

      {/* Coming Soon Banner */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6 mb-8 text-center">
        <p className="text-2xl font-bold text-blue-500 mb-2">Coming Soon</p>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          SITUS Groups Can Create and Issue their own Certificates of Ensurance
        </p>
      </div>

      {/* Mock Create Form */}
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Image Upload */}
        <div className="bg-gray-800/50 border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
          <div className="flex flex-col items-center">
            <Image 
              src="/assets/icons/upload.svg"
              alt="Upload"
              width={48}
              height={48}
              className="mb-4 opacity-50"
            />
            <p className="text-gray-400 mb-2">Drop your certificate image here</p>
            <p className="text-gray-500 text-sm">or</p>
            <button className="mt-2 px-4 py-2 bg-gray-700 rounded-md text-gray-300 hover:bg-gray-600 transition-colors">
              Browse Files
            </button>
          </div>
        </div>

        {/* Certificate Details */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Certificate Name</label>
            <input
              type="text"
              placeholder="Enter certificate name"
              className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
            <textarea
              placeholder="Describe what this certificate ensures..."
              className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white h-32"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Funding Flows</label>
            <div className="space-y-3">
              {['Project Fund', 'Community Treasury', 'Protocol Fee'].map((flow) => (
                <div key={flow} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                  <span className="text-gray-300">{flow}</span>
                  <input
                    type="text"
                    placeholder="0%"
                    className="w-20 p-2 bg-gray-800 border border-gray-700 rounded text-white text-right"
                    disabled
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Issue Button */}
        <div className="pt-4">
          <Button
            disabled
            className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 text-white p-3 rounded-lg text-lg font-bold h-14 opacity-50 cursor-not-allowed"
          >
            ISSUE
          </Button>
        </div>
      </div>

      {/* Commented out sections for later */}
      {/* 
      <div className="w-full mt-12" id="distribution">
        <GroupEnsurance 
          ogName={currentOG?.og_name?.startsWith('.') ? currentOG.og_name.slice(1) : currentOG?.og_name || ''} 
          groupEnsuranceText={ogData?.group_ensurance}
        />
      </div>

      <div className="w-full">
        <AccountFeatures 
          ogName={currentOG?.og_name?.startsWith('.') ? currentOG.og_name.slice(1) : currentOG?.og_name || ''} 
          tagline={ogData?.tagline}
        />
      </div>
      */}
    </div>
  );
} 