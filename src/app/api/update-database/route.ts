import { NextResponse } from 'next/server';
import { updateSitusDatabase } from '@/lib/database';

export const runtime = 'edge';

const ADMIN_ADDRESSES = [
  '0xEAF9830bB7a38A3CEbcaCa3Ff9F626C424F3fB55',
  '0x79c2D72552Df1C5d551B812Eca906a90Ce9D840A',
  '0xcb598dD4770b06E744EbF5B31Bb3D6a538FBE4fE'
].map(address => address.toLowerCase());

export async function POST(request: Request) {
  const { walletAddress } = await request.json();

  if (!ADMIN_ADDRESSES.includes(walletAddress.toLowerCase())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Starting database update...');
    const result = await updateSitusDatabase();
    console.log('Database update completed successfully', result);
    return NextResponse.json({ 
      message: 'Database updated successfully', 
      details: result 
    });
  } catch (error) {
    console.error('Error updating database:', error);
    let errorMessage = 'Failed to update database';
    if (error instanceof Error) {
      errorMessage += `: ${error.message}`;
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}