import React from 'react'

interface AssetSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  placeholder?: string;
}

export function AssetSearch({ searchQuery, setSearchQuery, placeholder = "Search assets..." }: AssetSearchProps) {
  return (
    <div className="mb-8 max-w-md mx-auto">
      <input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white bg-white dark:bg-gray-700"
      />
    </div>
  )
}
