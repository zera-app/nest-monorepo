import { StrUtils } from '@utils/utils/string/str.utils';
import { prisma } from '../index';
import { ApplicationScope } from '@common/common/types/role-scope';
import { DatatableType } from '@common/common/types/datatable';
import { BadRequestException } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

type RoleType = {
  name: string;
  scope: ApplicationScope;
  permissionIds: string[];
};

export function roleModel(tx?: Prisma.TransactionClient) {
  const db = tx || prisma;

  return {
    user: db.user,

    async findAll(queryParam: DatatableType) {
      const { page, limit, search, sort, sortDirection } = queryParam;
      const finalLimit = Number(limit);
      const finalPage = Number(page);

      const allowedSort = ['name', 'scope', 'createdAt', 'updatedAt'];
      const sortDirectionAllowed = ['asc', 'desc'];
      const allowedFilter = ['name', 'createdAt', 'updatedAt'];

      if (!allowedSort.includes(sort)) {
        throw new BadRequestException('Invalid sort field');
      }

      if (!sortDirectionAllowed.includes(sortDirection)) {
        throw new BadRequestException('Invalid sort direction');
      }

      let where = {};
      if (search) {
        where = {
          OR: [
            {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ],
        };
      }

      let filter = {};
      if (queryParam.filter) {
        if (queryParam.filter['name']) {
          filter = {
            roles: {
              some: {
                role: {
                  name: {
                    equals: queryParam.filter['name'],
                  },
                },
              },
            },
          };
        }

        where = {
          ...where,
          ...filter,
        };
      }

      const users = await db.user.findMany({
        where,
        take: finalLimit,
        skip: (finalPage - 1) * finalLimit,
        orderBy: {
          [sort]: sortDirection,
        },
      });

      const total = await db.user.count({
        where,
      });

      return {
        data: users,
        total,
      };
    },

    async get(): Promise<{ id: string; name: string }[]> {
      return await db.user.findMany({
        select: {
          id: true,
          name: true,
        },
      });
    },

    async createRole(data: RoleType) {
      const role = await db.role.create({
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

    async findRoleByName(
      name: string[],
    ): Promise<{ id: string; name: string }[]> {
      return await db.role.findMany({
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

    async findRoleById(id: string) {
      return await db.role.findUnique({
        where: {
          id,
        },
      });
    },

    async updateRole(id: string, data: RoleType) {
      const role = await db.role.update({
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
        const permission = await db.permission.findFirst({
          where: {
            name: permissionId,
          },
        });
        if (!permission) {
          throw new Error('Permission not found');
        }
        finalPermissionId = permission.id;
      }

      return db.rolePermission.create({
        data: {
          roleId,
          permissionId: finalPermissionId,
        },
      });
    },

    async assignPermissionsToRole(roleId: string, permissionIds: string[]) {
      await db.rolePermission.deleteMany({
        where: {
          roleId,
        },
      });

      let finalPermissionIds = permissionIds;
      if (
        permissionIds.some((permissionId) => !StrUtils.isUuid(permissionId))
      ) {
        const permissions = await db.permission.findMany({
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

      return await db.rolePermission.createMany({
        data: finalPermissionIds.map((item) => ({
          roleId,
          permissionId: item,
        })),
      });
    },

    async findRolePermissions(roleId: string) {
      return await db.rolePermission.findMany({
        where: {
          roleId,
        },
      });
    },

    async revokePermissionFromRole(roleId: string, permissionId: string) {
      let finalPermissionId = permissionId;
      if (!StrUtils.isUuid(permissionId)) {
        const permission = await db.permission.findFirst({
          where: {
            name: permissionId,
          },
        });
        if (!permission) {
          throw new Error('Permission not found');
        }
        finalPermissionId = permission.id;
      }

      return await db.rolePermission.deleteMany({
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
        const permissions = await db.permission.findMany({
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

      return await db.rolePermission.deleteMany({
        where: {
          roleId,
          permissionId: {
            in: permissionIds,
          },
        },
      });
    },
  };
}
