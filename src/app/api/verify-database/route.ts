import { NextResponse } from 'next/server';
import { verifyDatabaseState } from '@/lib/database';
import { isAdmin } from '@/utils/adminUtils';

export async function POST(request: Request) {
  try {
    const { walletAddress } = await request.json();

    if (!isAdmin(walletAddress)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const report = await verifyDatabaseState();
    return NextResponse.json({ report });
  } catch (error) {
    console.error('Error in verify-database route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
