import { fixMismatches } from '@/lib/database';
import { isAdmin } from '@/utils/adminUtils';
import { NextResponse } from 'next/server';
import type { ValidationReport } from '@/types';

export async function POST(request: Request) {
  try {
    const { walletAddress, report } = await request.json();
    
    if (!isAdmin(walletAddress)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results = await fixMismatches(report as ValidationReport);
    
    return NextResponse.json({
      success: true,
      message: 'Database fixes applied successfully',
      details: results
    });
  } catch (error) {
    console.error('Error in fix-database route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 