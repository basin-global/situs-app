'use client';

import Image from 'next/image'
import { useState, useEffect } from 'react'

interface Logo {
  src: string;
  name: string;
  size: 'sm' | 'm' | 'lg' | 'xl';
}

export default function PossibleSection({ logos }: { logos: Logo[] }) {
  const [organizedLogos, setOrganizedLogos] = useState<Logo[]>([]);

  useEffect(() => {
    // Filter out .DS_Store, organize and sort logos
    const filteredLogos = logos
      .filter(logo => !logo.src.includes('.DS_Store'))
      .sort((a, b) => {
        const sizeOrder = { 'xl': 0, 'lg': 1, 'm': 2, 'sm': 3 };
        return sizeOrder[a.size] - sizeOrder[b.size];
      });
    setOrganizedLogos(filteredLogos);
  }, [logos]);

  const getLogoSize = (size: 'sm' | 'm' | 'lg' | 'xl') => {
    switch (size) {
      case 'sm': return 90;
      case 'lg': return 165;
      case 'xl': return 200;
      default: return 140; // medium
    }
  };

  return (
    <section className="bg-gradient-to-b from-background-dark to-black text-foreground-dark py-20 px-8">
      <h2 className="font-mono text-6xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 tracking-wider">
        MANIFEST
      </h2>
      <p className="font-sans text-2xl mb-12 text-center max-w-3xl mx-auto leading-relaxed">
        SITUS is <span className="font-bold text-accent-dark">proudly built</span> on these permissionless, modular, composable, and interoperable projects.
      </p>
      <div className="flex flex-wrap justify-center items-center gap-12 max-w-6xl mx-auto">
        {organizedLogos.map((logo, index) => {
          const size = getLogoSize(logo.size);
          return (
            <div 
              key={index} 
              className="relative transition-all duration-300 hover:scale-110 hover:z-10"
              style={{ flex: `0 1 ${size}px` }}
            >
              <Image
                src={logo.src}
                alt={`${logo.name} logo`}
                width={size}
                height={size}
                className="w-full h-auto"
              />
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {logo.name}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  )
}