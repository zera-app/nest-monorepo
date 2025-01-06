import { PrismaClient } from '@prisma/client';

export async function seedRole(prisma: PrismaClient) {
  const roles = ['admin', 'user'];
  await prisma.role.createMany({
    data: roles.map((name) => ({
      name,
    })),
  });

  const AdminRole = await prisma.role.findUnique({
    where: {
      name: 'admin',
    },
  });

  const permissions = await prisma.permission.findMany();

  await prisma.rolePermission.createMany({
    data: permissions.map((permission) => ({
      permissionId: permission.id,
      roleId: AdminRole.id,
    })),
  });

  console.log('Role seed completed');
}
