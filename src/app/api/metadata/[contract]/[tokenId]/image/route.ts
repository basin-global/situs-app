import { getMetadata } from '@/modules/metadata/handlers';
import { generateAccountImage } from '@/modules/metadata/ImageGenerator';

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: { contract: string; tokenId: string } }
) {
  try {
    const metadata = await getMetadata(params.contract, params.tokenId);
    const imageBuffer = await generateAccountImage(
      metadata.image,
      metadata.name,
      params.contract,
      params.tokenId,
      { fontSize: 48 }
    );

    return new Response(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
        'CDN-Cache-Control': 'public, max-age=86400',
      }
    });
  } catch (error) {
    console.error('Error generating image:', error);
    return new Response('Error generating image', { status: 500 });
  }
} 