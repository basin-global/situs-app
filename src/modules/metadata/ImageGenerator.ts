import { ImageResponse } from '@vercel/og';
import { put } from '@vercel/blob';
import React from 'react';
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
    y: 200
  }
};

export async function generateAccountImage(
  baseImageUrl: string,
  accountName: string,
  ogName: string,
  tokenId: string,
  style: Partial<ImageStyle> = {}
): Promise<string> {
  try {
    const finalStyle = { ...DEFAULT_STYLE, ...style };

    const fontPath = path.resolve('./public/fonts/OpenSans-Bold.ttf');
    const fontData = await fs.readFile(fontPath);

    const imageResponse = new ImageResponse(
      React.createElement(
        'div',
        {
          style: {
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: `url(${baseImageUrl})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            fontFamily: '"Open Sans"',
            color: finalStyle.color,
          } as const,
        },
        React.createElement(
          'div',
          {
            style: {
              width: '100%',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginTop: '100px',
            },
          },
          React.createElement(
            'div',
            {
              style: {
                fontSize: finalStyle.fontSize,
                lineHeight: 1.2,
                textTransform: 'lowercase',
                textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                fontWeight: 800,
              },
            },
            accountName
          )
        )
      ),
      {
        width: 1000,
        height: 1000,
        fonts: [
          {
            name: 'Open Sans',
            data: fontData,
            weight: 800,
            style: 'normal',
          },
        ],
      }
    );

    // Convert the response to a buffer
    const buffer = await imageResponse.arrayBuffer();

    // Store in blob storage
    const { url } = await put(
      `${ogName}/generated/${tokenId}.png`,
      Buffer.from(buffer),
      { access: 'public', addRandomSuffix: false }
    );

    return url;

  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
} 