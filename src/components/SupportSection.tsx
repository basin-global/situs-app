'use client';

import Image from 'next/image'
import { useEffect, useRef } from 'react'

interface Logo {
  src: string;
  name: string;
}

export default function SupportSection({ logos }: { logos: Logo[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const scrollWidth = scrollContainer.scrollWidth;
    const clientWidth = scrollContainer.clientWidth;

    let scrollPosition = 0;
    const scroll = () => {
      scrollPosition += 0.75; // Slow scrolling speed
      if (scrollPosition > scrollWidth / 2) {
        scrollPosition = 0;
      }
      scrollContainer.scrollLeft = scrollPosition;
      requestAnimationFrame(scroll);
    };

    const animation = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animation);
  }, []);

  return (
    <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-20 px-8 overflow-hidden">
      <h3 className="text-4xl font-mono font-bold mb-12 text-center tracking-wider">
        With support & tooling from:
      </h3>
      <div 
        ref={scrollRef}
        className="flex space-x-20 overflow-hidden"
        style={{ width: '200%' }}
      >
        {[...logos, ...logos].map((logo, index) => (
          <div key={index} className="flex-shrink-0 hover:scale-110 transition-transform duration-300 w-40 h-40 flex items-center justify-center">
            <Image
              src={logo.src}
              alt={`${logo.name} logo`}
              width={200}
              height={200}
              className="w-full h-full object-contain"
            />
          </div>
        ))}
      </div>
    </section>
  )
}