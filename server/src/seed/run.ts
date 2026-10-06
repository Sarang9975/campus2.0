import dotenv from 'dotenv';
dotenv.config();

import { connectDB, disconnectDB } from '../utils/db.js';
import { seedDatabase } from './seedRunner.js';

async function main() {
  try {
    await connectDB();
    await seedDatabase();
    console.log('[seed] Done!');
    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('[seed] Error:', err);
    process.exit(1);
  }
}

main();
