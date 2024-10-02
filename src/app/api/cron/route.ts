import { NextResponse } from 'next/server';
import { updateSitusDatabase } from '@/lib/database';

export const runtime = 'edge';

// This API route handles cron job requests for full or incremental database updates.
// It requires authorization via a bearer token and supports two update types: 'full' and 'incremental'.

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const result = await updateSitusDatabase();
    return NextResponse.json({ success: true, message: 'Database update completed', details: result });
  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}