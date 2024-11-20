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
    
    const metadata = await getMetadata(params.contract, params.tokenId);
    console.log('Got metadata:', metadata);
    
    // Generate the image with text overlay
    console.log('Generating image with:', {
      baseImage: metadata.image,
      name: metadata.name,
      ogName: metadata.og_name,
      tokenId: params.tokenId
    });

    const generatedImageUrl = await generateAccountImage(
      metadata.image,
      metadata.name,
      metadata.og_name,
      params.tokenId
    );

    console.log('Generated image URL:', generatedImageUrl);

    return new Response(JSON.stringify({
      ...metadata,
      image: generatedImageUrl
    }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in metadata route:', error);
    return new Response('Error generating metadata', { status: 500 });
  }
}
