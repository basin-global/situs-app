
import { NextResponse } from 'next/server';
import { updateSitusDatabase } from '@/lib/database';

export async function GET() {
  try {
    await updateSitusDatabase();
    return NextResponse.json({ message: 'Database updated successfully' });
  } catch (error) {
    console.error('Error updating database:', error);
    return NextResponse.json({ error: 'Failed to update database' }, { status: 500 });
  }
}