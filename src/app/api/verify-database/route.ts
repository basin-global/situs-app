import { verifyDatabaseState, updateEnsuranceDatabase } from '@/lib/database';
import { isAdmin } from '@/utils/adminUtils';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { walletAddress, type } = await request.json();
    
    if (!isAdmin(walletAddress)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (type === 'ensurance') {
      const report = await updateEnsuranceDatabase();
      return NextResponse.json({ 
        success: true,
        message: report.summary,
        report: {
          chains: report.chains,
          summary: report.summary
        }
      });
    }

    const report = await verifyDatabaseState();
    return NextResponse.json({ 
      report,
      details: {
        missingAccounts: report.accounts.missing.length,
        missingTBA: report.accounts.missingTBA.length,
        invalidAccounts: report.accounts.invalid.length
      }
    });
  } catch (error) {
    console.error('Error in verify-database route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
