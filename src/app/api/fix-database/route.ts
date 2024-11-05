import { NextResponse } from 'next/server';
import { fixMismatches } from '@/lib/database';
import { isAdmin } from '@/utils/adminUtils';
import { ValidationReport } from '@/types';

export async function POST(request: Request) {
  try {
    const { walletAddress, report } = await request.json();
    
    console.log('Fix Database Route - Received request:', {
      walletAddress,
      reportReceived: !!report,
      reportContent: report
    });

    if (!isAdmin(walletAddress)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!report || !report.ogs) {
      return NextResponse.json({ 
        error: 'Invalid report data provided' 
      }, { status: 400 });
    }

    console.log('Starting to fix database mismatches');
    const results = await fixMismatches(report as ValidationReport);
    
    return NextResponse.json({ 
      success: true,
      message: `Fixed ${results.total} items`,
      details: {
        accounts: `Fixed ${results.fixed.accounts.length} accounts`,
        totalSupply: `Fixed ${results.fixed.totalSupply.length} total supply mismatches`,
        tbaAddresses: `Fixed ${results.fixed.tbaAddresses.length} TBA addresses`,
        failed: results.failed.length > 0 ? `Failed to fix ${results.failed.length} items` : 'No failures'
      }
    });
  } catch (error) {
    console.error('Error in fix-database route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 