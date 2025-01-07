import { PrismaClient } from '@prisma/client';
import { permissionSeeder } from './permission.seed';
import { seedRole } from './role.seed';
import { userSeeder } from './user.seed';

export default async function seed(prisma: PrismaClient) {
  await permissionSeeder(prisma);
  await seedRole(prisma);
  await userSeeder(prisma);
}
