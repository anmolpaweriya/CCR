import { connectDB, disconnectDB } from '../config/db.js';
import { seedDatabase } from './seedData.js';

const run = async () => {
  try {
    await connectDB();
    await seedDatabase();
    console.log('Seeding completed successfully');
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

run();
