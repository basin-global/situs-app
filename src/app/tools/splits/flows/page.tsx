'use client';

import { useState } from 'react';
import { FlowViewer } from '@/modules/splits/flows/FlowViewer';
import { getActiveChains } from '@/config/chains';

export default function FlowsPage() {
  const [address, setAddress] = useState('');
  const [selectedChainId, setSelectedChainId] = useState(8453); // Default to Base
  const [showFlow, setShowFlow] = useState(false);

  const activeChains = getActiveChains();

  const handleView = () => {
    if (!address) return;
    setShowFlow(true);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-200">Split Flow Visualization</h1>
      
      <div className="mb-6 max-w-2xl flex gap-4">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter split address (0x...)"
          className="flex-1 px-4 py-2 rounded-md bg-gray-800 text-gray-200 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
        />
        <select
          value={selectedChainId}
          onChange={(e) => setSelectedChainId(Number(e.target.value))}
          className="w-32 px-4 py-2 rounded-md bg-gray-800 text-gray-200 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {activeChains.map(chain => (
            <option key={chain.id} value={chain.id}>
              {chain.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleView}
          className="px-8 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          View Flow
        </button>
      </div>

      {showFlow && (
        <FlowViewer 
          address={address} 
          chainId={selectedChainId}
        />
      )}
    </div>
  );
} 