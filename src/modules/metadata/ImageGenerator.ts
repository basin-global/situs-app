import sharp from 'sharp';
import { put } from '@vercel/blob';

interface ImageStyle {
  fontSize: number;
  color: string;
  position: {
    x: number;
    y: number;
  };
}

const DEFAULT_STYLE: ImageStyle = {
  fontSize: 48,
  color: '#FFFFFF',
  position: {
    x: 50,  // percentage from left
    y: 85   // percentage from top
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

export async function generateAccountImage(
  baseImageUrl: string,
  accountName: string,
  ogName: string,
  tokenId: string,
  style: Partial<ImageStyle> = {}
): Promise<string> {
  try {
    // Merge default style with any custom style
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

    // Create a gradient overlay SVG
    const gradientOverlay = Buffer.from(`
      <svg width="${metadata.width}" height="${metadata.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="overlay" x1="0%" y1="70%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="rgba(0,0,0,0)" />
            <stop offset="100%" stop-color="rgba(0,0,0,0.7)" />
          </linearGradient>
        </defs>
        <rect width="${metadata.width}" height="${metadata.height}" fill="url(#overlay)" />
      </svg>
    `);

    // Create text SVG with escaped text
    const textOverlay = Buffer.from(`
      <svg width="${metadata.width}" height="${metadata.height}" xmlns="http://www.w3.org/2000/svg">
        <text 
          x="${(metadata.width * finalStyle.position.x) / 100}" 
          y="${(metadata.height * finalStyle.position.y) / 100}" 
          font-family="sans-serif"
          font-size="${finalStyle.fontSize}"
          fill="${finalStyle.color}"
          text-anchor="middle"
          dominant-baseline="middle"
        >
          ${escapeXml(accountName)}
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