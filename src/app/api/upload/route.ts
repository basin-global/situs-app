import { handleUpload } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = await request.json();
  
  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname: string) => ({
        allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif'],
        maximumSizeInBytes: 1024 * 1024 * 30,
      }),
      onUploadCompleted: async ({ blob }) => {
        console.log('Upload completed:', blob);
      }
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
} 