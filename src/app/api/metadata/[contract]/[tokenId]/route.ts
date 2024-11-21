import { getMetadata } from '@/modules/metadata/handlers';
import { generateAccountImage } from '@/modules/metadata/ImageGenerator';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(
  request: Request,
  { params }: { params: { contract: string; tokenId: string } }
) {
  try {
    console.log('Metadata request for:', params);
    
    // Force bypass cache for the metadata fetch
    const metadata = await getMetadata(params.contract, params.tokenId);
    
    // Generate new image every time
    const generatedImageUrl = await generateAccountImage(
      metadata.image,
      metadata.name,
      metadata.og_name,
      params.tokenId
    );

    // Return with strong no-cache headers
    return new Response(JSON.stringify({
      ...metadata,
      image: generatedImageUrl,
      // Add cache buster to image URL
      cached_at: Date.now()
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error in metadata route:', error);
    return new Response('Error generating metadata', { status: 500 });
  }
}
