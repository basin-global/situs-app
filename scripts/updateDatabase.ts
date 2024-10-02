// This script updates the Situs database by calling the updateSitusDatabase function from ../src/lib/database
// The scheduler for this script is a Vercel cron job

import { updateSitusDatabase } from '../src/lib/database';

async function main() {
  try {
    await updateSitusDatabase();
    console.log('Database update completed successfully');
  } catch (error) {
    console.error('Error updating database:', error);
    process.exit(1);
  }
}

main();