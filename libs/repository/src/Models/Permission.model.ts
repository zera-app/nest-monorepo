import { prisma } from '../index';

export function PermissionModel() {
  return Object.assign(prisma, {
    permission: prisma.permission,

    async createPermission(data: { name: string; description: string }) {
      return await prisma.permission.create({
        data,
      });
    },

    async findPermissionByName(
      name: string[],
    ): Promise<{ id: string; name: string }[]> {
      return await prisma.permission.findMany({
        where: {
          name: {
            in: name,
          },
        },
        select: {
          id: true,
          name: true,
        },
      });
    },

    async findPermissionById(id: string) {
      return await prisma.permission.findUnique({
        where: {
          id,
        },
      });
    },

    async updatePermission(
      id: string,
      data: { name: string; description: string },
    ) {
      return await prisma.permission.update({
        where: {
          id,
        },
        data,
      });
    },

    async deletePermission(id: string) {
      return await prisma.permission.delete({
        where: {
          id,
        },
      });
    },
  });
}
