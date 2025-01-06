import { PrismaClient } from '@prisma/client';

export async function permissionSeeder(prisma: PrismaClient) {
  const permissions = [
    'view:admin-dashboard',
    'view:user-dashboard',
    'create:user',
    'update:user',
    'delete:user',
  ];

  await prisma.permission.createMany({
    data: permissions.map((name) => ({
      name,
    })),
  });

  console.log('Permission seed completed');
}
