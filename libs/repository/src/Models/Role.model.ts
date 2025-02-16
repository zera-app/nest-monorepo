import { StrUtils } from '@utils/utils/string/str.utils';
import { prisma } from '../index';
import { ApplicationScope } from '@common/common/types/role-scope';
import { DatatableType } from '@common/common/types/datatable';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DateUtils } from '@utils/utils';
import { PaginationResponse } from '@common/common/types/pagination';

type RoleType = {
  name: string;
  scope: ApplicationScope;
  permissionIds: string[];
};

export type RoleDatatable = {
  id: string;
  name: string;
  scope: string;
  createdAt: Date;
  updatedAt: Date;
};

export type RoleDetail = {
  id: string;
  name: string;
  scope: string;
  createdAt: Date;
  updatedAt: Date;
  permissions: {
    id: string;
    name: string;
  }[];
};

export function roleModel(tx?: Prisma.TransactionClient) {
  const db = tx || prisma;

  return {
    role: db.role,

    async datatable(
      queryParam: DatatableType,
    ): Promise<PaginationResponse<RoleDatatable>> {
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

      if (queryParam.filter) {
        const filterKeys = Object.keys(queryParam.filter);
        for (const key of filterKeys) {
          if (!allowedFilter.includes(key)) {
            throw new BadRequestException('Invalid filter field');
          }
        }
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

        if (
          queryParam.filter['createdAt'] &&
          typeof queryParam.filter['createdAt'] === 'string'
        ) {
          const [startDate, endDate] =
            queryParam.filter['createdAt'].split(',');
          filter = {
            ...filter,
            createdAt: {
              gte: DateUtils.parse(startDate),
              ...(endDate && { lte: DateUtils.parse(endDate) }),
            },
          };
        }

        if (
          queryParam.filter['updatedAt'] &&
          typeof queryParam.filter['updatedAt'] === 'string'
        ) {
          const [startDate, endDate] =
            queryParam.filter['updatedAt'].split(',');
          filter = {
            ...filter,
            updatedAt: {
              gte: DateUtils.parse(startDate),
              ...(endDate && { lte: DateUtils.parse(endDate) }),
            },
          };
        }

        where = {
          ...where,
          ...filter,
        };
      }

      const roles = await db.role.findMany({
        where,
        take: finalLimit,
        skip: (finalPage - 1) * finalLimit,
        orderBy: {
          [sort]: sortDirection,
        },
        select: {
          id: true,
          name: true,
          scope: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const total = await db.role.count({
        where,
      });

      return {
        data: roles,
        limit: finalLimit,
        page: finalPage - 1,
        totalCount: total,
      };
    },

    async create(data: {
      name: string;
      scope: string;
      permissionIds: string[];
    }): Promise<any> {
      const role = await db.role.create({
        data: {
          name: data.name,
          scope: data.scope,
        },
      });

      if (data.permissionIds && data.permissionIds.length) {
        await this.assignPermissionsToRole(role.id, data.permissionIds);
      }

      return role;
    },

    async findOne(id: string): Promise<RoleDetail> {
      const role = await db.role.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          name: true,
          scope: true,
          createdAt: true,
          updatedAt: true,
          permissions: {
            select: {
              permission: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!role) {
        throw new NotFoundException('Role not found');
      }

      return {
        id: role.id,
        name: role.name,
        scope: role.scope,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
        permissions: role.permissions.map((item) => item.permission),
      };
    },

    async update(
      id: string,
      data: {
        name: string;
        scope: string;
        permissionIds: string[];
      },
    ): Promise<any> {
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

    async delete(id: string): Promise<any> {
      return await db.role.delete({
        where: {
          id,
        },
      });
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
