import { prisma } from '../index';

export function RoleUserModel() {
  return Object.assign(prisma, {
    roleUser: prisma.roleUser,
  });
}
