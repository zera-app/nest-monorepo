import { StrUtils } from '@utils/utils/string/str.utils';
import { prisma } from '../index';
import { ApplicationScope } from '@common/common/types/role-scope';

type RoleType = {
  name: string;
  scope: ApplicationScope;
  permissionIds: string[];
};

export function roleModel() {
  return Object.assign(prisma, {
    user: prisma.user,

    async createRole(data: RoleType) {
      const role = await prisma.role.create({
        data: {
          name: data.name,
          scope: data.scope,
        },
      });

      if (data.permissionIds.length) {
        await this.assignPermissionsToRole(role.id, data.permissionIds);
      }

      return role;
    },

    async findRoleByName(name: string) {
      return await prisma.role.findFirst({
        where: {
          name,
        },
      });
    },

    async findRoleById(id: string) {
      return await prisma.role.findUnique({
        where: {
          id,
        },
      });
    },

    async updateRole(id: string, data: RoleType) {
      const role = await prisma.role.update({
        where: {
          id,
        },
        data: {
          name: data.name,
          scope: data.scope,
        },
      });

      if (data.permissionIds.length) {
        await this.assignPermissionsToRole(role.id, data.permissionIds);
      }

      return role;
    },

    // ROLE BASE ACCESS CONTROL (RBAC) ========================

    async assignPermission(roleId: string, permissionId: string) {
      let finalPermissionId = permissionId;
      if (!StrUtils.isUuid(permissionId)) {
        const permission = await prisma.permission.findFirst({
          where: {
            name: permissionId,
          },
        });
        if (!permission) {
          throw new Error('Permission not found');
        }
        finalPermissionId = permission.id;
      }

      return prisma.rolePermission.create({
        data: {
          roleId,
          permissionId: finalPermissionId,
        },
      });
    },

    async assignPermissionsToRole(roleId: string, permissionIds: string[]) {
      await prisma.rolePermission.deleteMany({
        where: {
          roleId,
        },
      });

      let finalPermissionIds = permissionIds;
      if (
        permissionIds.some((permissionId) => !StrUtils.isUuid(permissionId))
      ) {
        const permissions = await prisma.permission.findMany({
          where: {
            name: {
              in: permissionIds,
            },
          },
        });

        if (!permissions) {
          throw new Error('Permissions not found');
        }

        finalPermissionIds = permissions.map((permission) => permission.id);
      }

      return await prisma.rolePermission.createMany({
        data: finalPermissionIds.map((item) => ({
          roleId,
          permissionId: item,
        })),
      });
    },

    async findRolePermissions(roleId: string) {
      return await prisma.rolePermission.findMany({
        where: {
          roleId,
        },
      });
    },

    async revokePermissionFromRole(roleId: string, permissionId: string) {
      let finalPermissionId = permissionId;
      if (!StrUtils.isUuid(permissionId)) {
        const permission = await prisma.permission.findFirst({
          where: {
            name: permissionId,
          },
        });
        if (!permission) {
          throw new Error('Permission not found');
        }
        finalPermissionId = permission.id;
      }

      return await prisma.rolePermission.deleteMany({
        where: {
          roleId,
          permissionId: finalPermissionId,
        },
      });
    },

    async revokePermissionsFromRole(roleId: string, permissionIds: string[]) {
      if (
        permissionIds.some((permissionId) => !StrUtils.isUuid(permissionId))
      ) {
        const permissions = await prisma.permission.findMany({
          where: {
            name: {
              in: permissionIds,
            },
          },
        });

        if (!permissions) {
          throw new Error('Permissions not found');
        }

        permissionIds = permissions.map((permission) => permission.id);
      }

      return await prisma.rolePermission.deleteMany({
        where: {
          roleId,
          permissionId: {
            in: permissionIds,
          },
        },
      });
    },
  });
}
