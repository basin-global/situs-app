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

    return Response.json({
      ...metadata,
      image: generatedImageUrl
    });
  } catch (error) {
    console.error('Error in metadata route:', error);
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    return Response.json({ error: 'Failed to generate metadata' }, { status: 500 });
  }
}
