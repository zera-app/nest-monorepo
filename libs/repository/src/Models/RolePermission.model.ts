import { prisma } from '../index';

export function RolePermission() {
  return Object.assign(prisma, {
    rolePermission: prisma.rolePermission,
  });
}
