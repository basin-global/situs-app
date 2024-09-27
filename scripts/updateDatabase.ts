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