import { PrismaClient } from '@prisma/client';
import seed from './seeders';

const prisma = new PrismaClient();

const runSeed = async () => {
  console.log('Seeding database...');
  seed(prisma);
  console.log('Database seeded');
  console.log('Closing database connection...');
};

runSeed();
