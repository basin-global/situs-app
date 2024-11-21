import sharp from 'sharp';
import { put } from '@vercel/blob';
import fs from 'fs/promises';
import path from 'path';

interface ImageStyle {
  fontSize: number;
  color: string;
  position: {
    x: number;
    y: number;
  };
}

const DEFAULT_STYLE: ImageStyle = {
  fontSize: 64,
  color: '#FFFFFF',
  position: {
    x: 50,
    y: 75
  }
};

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

export const dynamic = 'force-dynamic'; // Disable caching
export const fetchCache = 'force-no-store'; // Disable fetch caching

// Updated wrap function to break at hyphens
function wrapText(text: string): string[] {
  // Split at hyphens but keep the hyphen with the first part
  return text.split('-').map((part, i, arr) => 
    i < arr.length - 1 ? part + '-' : part
  );
}

export async function generateAccountImage(
  baseImageUrl: string,
  accountName: string,
  ogName: string,
  tokenId: string,
  style: Partial<ImageStyle> = {}
): Promise<string> {
  try {
    const finalStyle = { ...DEFAULT_STYLE, ...style };

    // Load the base image with just no-store
    const imageResponse = await fetch(baseImageUrl, { 
      cache: 'no-store'
    });
    const imageArrayBuffer = await imageResponse.arrayBuffer();
    const baseImage = await sharp(Buffer.from(imageArrayBuffer));
    const metadata = await baseImage.metadata();
    
    if (!metadata.width || !metadata.height) {
      throw new Error('Could not get image dimensions');
    }

    // Create a more focused gradient overlay SVG
    const gradientOverlay = Buffer.from(`
      <svg width="${metadata.width}" height="${metadata.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="overlay" cx="50%" cy="${finalStyle.position.y}%" r="50%" fx="50%" fy="${finalStyle.position.y}%">
            <stop offset="0%" stop-color="rgba(0,0,0,0.6)" />
            <stop offset="60%" stop-color="rgba(0,0,0,0.2)" />
            <stop offset="100%" stop-color="rgba(0,0,0,0)" />
          </radialGradient>
        </defs>
        <rect 
          x="0" 
          y="${metadata.height * (finalStyle.position.y/100 - 0.2)}" 
          width="${metadata.width}" 
          height="${metadata.height * 0.4}" 
          fill="url(#overlay)" 
        />
      </svg>
    `);

    const wrappedLines = wrapText(accountName);

    const textOverlay = Buffer.from(`
      <svg width="${metadata.width}" height="${metadata.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow">
            <feDropShadow dx="0" dy="1" stdDeviation="0" flood-opacity="1" flood-color="rgba(0,0,0,0.7)"/>
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.8"/>
            <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.5"/>
          </filter>
          <linearGradient id="textBackground" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:rgba(0,0,0,0.4)" />
            <stop offset="100%" style="stop-color:rgba(0,0,0,0.6)" />
          </linearGradient>
        </defs>
        
        <!-- Text backdrop for better contrast -->
        <rect
          x="${(metadata.width! * finalStyle.position.x) / 100 - metadata.width! * 0.4}"
          y="${(metadata.height! * finalStyle.position.y) / 100 - finalStyle.fontSize}"
          width="${metadata.width! * 0.8}"
          height="${finalStyle.fontSize * wrappedLines.length * 1.5}"
          rx="5"
          fill="url(#textBackground)"
          filter="blur(20px)"
          opacity="0.7"
        />

        <text 
          x="${(metadata.width! * finalStyle.position.x) / 100}" 
          y="${(metadata.height! * finalStyle.position.y) / 100}" 
          font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, sans-serif"
          font-size="${finalStyle.fontSize}"
          font-weight="800"
          fill="${finalStyle.color}"
          text-anchor="middle"
          dominant-baseline="middle"
          filter="url(#shadow)"
          letter-spacing="0.05em"
          style="text-transform: lowercase"
        >
          ${wrappedLines.map((line, i) => 
            `<tspan 
              x="${(metadata.width! * finalStyle.position.x) / 100}" 
              dy="${i === 0 ? 0 : finalStyle.fontSize * 1.2}"
              letter-spacing="0.05em"
            >${escapeXml(line)}</tspan>`
          ).join('')}
        </text>
      </svg>
    `);

    // Generate the new image
    const buffer = await baseImage
      .composite([
        {
          input: gradientOverlay,
          top: 0,
          left: 0,
        },
        {
          input: textOverlay,
          top: 0,
          left: 0,
        }
      ])
      .png()
      .toBuffer();

    // Store in blob storage under generated folder
    const { url } = await put(
      `${ogName}/generated/${tokenId}.png`,
      buffer,
      { access: 'public', addRandomSuffix: false }
    );

    return url;

  } catch (error) {
    console.error('Error generating account image:', error);
    throw error;
  }
} 