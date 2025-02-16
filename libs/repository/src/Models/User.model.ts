import { StrUtils } from '@utils/utils/string/str.utils';
import { prisma, roleModel } from '../index';
import { DatatableType } from '@common/common/types/datatable';
import { PaginationResponse } from '@common/common/types/pagination';
import { UserInformation } from '@common/common/types/user-information';
import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DateUtils } from '@utils/utils';

export type UserType = {
  id: string;
  name: string;
  email: string;
  roles: {
    role: {
      name: string;
    };
  }[];
  createdAt: Date;
  updatedAt: Date;
};

export function UserModel(tx?: Prisma.TransactionClient) {
  const db = tx || prisma;

  return {
    user: db.user,

    async findAll(
      queryParam: DatatableType,
      withRole: boolean = false,
    ): Promise<PaginationResponse<UserType>> {
      const { page, limit, search, sort, sortDirection } = queryParam;
      const finalLimit = Number(limit);
      const finalPage = Number(page);

      const allowedSort = ['name', 'email', 'createdAt', 'updatedAt'];
      const sortDirectionAllowed = ['asc', 'desc'];
      const allowedFilter = ['role', 'createdAt', 'updatedAt'];

      if (!allowedSort.includes(sort)) {
        throw new BadRequestException('Invalid sort field');
      }

      if (!sortDirectionAllowed.includes(sortDirection)) {
        throw new BadRequestException('Invalid sort direction');
      }

      if (queryParam.filter) {
        for (const key in queryParam.filter) {
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
            {
              email: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ],
        };
      }

      let filter = {};
      if (queryParam.filter) {
        if (queryParam.filter['role']) {
          filter = {
            roles: {
              some: {
                role: {
                  name: {
                    contains: queryParam.filter['role'],
                    mode: 'insensitive',
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
            createdAt: endDate
              ? {
                  gte: DateUtils.parse(startDate),
                  lte: DateUtils.parse(endDate),
                }
              : {
                  gte: DateUtils.parse(startDate),
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
            updatedAt: endDate
              ? {
                  gte: DateUtils.parse(startDate),
                  lte: DateUtils.parse(endDate),
                }
              : {
                  gte: DateUtils.parse(startDate),
                },
          };
        }

        where = {
          AND: [where, filter],
        };
      }

      const select = withRole
        ? {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            updatedAt: true,
            roles: {
              select: {
                role: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          }
        : {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            updatedAt: true,
          };

      const data = await db.user.findMany({
        where,
        take: finalLimit,
        skip: (finalPage - 1) * finalLimit,
        orderBy: {
          [sort]: sortDirection,
        },
        select,
      });

      return {
        data: data,
        page: finalPage - 1,
        limit: finalLimit,
        totalCount: await db.user.count({ where }),
      };
    },

    async create(data: {
      name: string;
      email: string;
      password: string;
      roles?: string[];
    }): Promise<UserInformation> {
      const newData = await db.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: data.password,
        },
      });

      if (data.roles) {
        const roles = await roleModel(tx).findRoleByName(data.roles);
        await this.assignRolesToUser(
          newData.id,
          roles.map((role) => role.id),
        );
      }

      return await this.detailProfile(newData.id);
    },

    // don't change this for authentication flow
    async findUserByEmail(email: string): Promise<{
      id: string;
      name: string | null;
      email: string;
      password: string;
      emailVerifiedAt: Date | null;
      updatedAt: Date;
      createdAt: Date;
    } | null> {
      return await db.user.findUnique({
        where: {
          email,
        },
      });
    },

    async findOneByEmail(email: string): Promise<{
      id: string;
      name: string | null;
      email: string;
      password: string;
      updatedAt: Date | null;
      createdAt: Date | null;
    } | null> {
      return await db.user.findFirst({
        where: {
          email,
        },
        select: {
          id: true,
          name: true,
          email: true,
          password: true,
          updatedAt: true,
          createdAt: true,
        },
      });
    },

    async detailProfile(userId: string): Promise<UserInformation> {
      const user = await db.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
          roles: {
            select: {
              role: {
                select: {
                  id: true,
                  name: true,
                  scope: true,
                },
              },
            },
          },
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const rolePermission = await db.rolePermission.findMany({
        where: {
          roleId: {
            in: user.roles.map((role) => role.role.id),
          },
        },
      });

      const permission = await db.permission.findMany({
        where: {
          id: {
            in: rolePermission.map((item) => item.permissionId),
          },
        },
      });

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles.map((role) => ({
          role: {
            name: role.role.name,
            scope: role.role.scope,
          },
        })),

        permissions: permission
          .filter((item) =>
            rolePermission.some((rp) => rp.permissionId === item.id),
          )
          .map((item) => item.name),
      };
    },

    async update(
      userId: string,
      data: {
        name: string;
        email: string;
        password?: string;
        roles?: string[];
      },
    ) {
      const newData = await db.user.update({
        where: {
          id: userId,
        },
        data: {
          name: data.name,
          email: data.email,
          ...(data.password && { password: data.password }),
        },
      });

      if (data.roles) {
        const roles = await roleModel(tx).findRoleByName(data.roles);
        const currentRoles = await this.findUserRoles(userId);
        await this.revokeRolesFromUser(
          userId,
          currentRoles.map((role) => role.roleId),
        );

        await this.assignRolesToUser(
          userId,
          roles.map((role) => role.id),
        );
      }

      return await this.detailProfile(newData.id);
    },

    async delete(userId: string): Promise<void> {
      await db.user.delete({
        where: {
          id: userId,
        },
      });
    },

    // ROLE BASED ACCESS CONTROL (RBAC) ========================

    async assignRoleToUser(userId: string, roleId: string) {
      let finalRoleId = roleId;
      if (!StrUtils.isUuid(roleId)) {
        const role = await db.role.findFirst({
          where: {
            name: roleId,
          },
        });
        if (!role) {
          throw new Error('Role not found');
        }

        finalRoleId = role.id;
      }

      return await db.roleUser.create({
        data: {
          userId: userId,
          roleId: finalRoleId,
        },
      });
    },

    async assignRolesToUser(userId: string, roleIds: string[]) {
      let finalRoleIds = roleIds;
      if (roleIds.some((roleId) => !StrUtils.isUuid(roleId))) {
        const roles = await db.role.findMany({
          where: {
            name: {
              in: roleIds,
            },
          },
        });

        if (!roles) {
          throw new Error('Role not found');
        }

        finalRoleIds = roles.map((role) => role.id);
      }

      return await db.roleUser.createMany({
        data: finalRoleIds.map((item) => ({
          userId: userId,
          roleId: item,
        })),
      });
    },

    async findUserRoles(userId: string) {
      return await db.roleUser.findMany({
        where: {
          userId,
        },
      });
    },

    async revokeRoleFromUser(userId: string, roleId: string) {
      let finalRoleId = roleId;
      if (!StrUtils.isUuid(roleId)) {
        const role = await db.role.findFirst({
          where: {
            name: roleId,
          },
        });
        if (!role) {
          throw new Error('Role not found');
        }

        finalRoleId = role.id;
      }

      return await db.roleUser.deleteMany({
        where: {
          userId: userId,
          roleId: finalRoleId,
        },
      });
    },

    async revokeRolesFromUser(userId: string, roleIds: string[]) {
      if (roleIds.some((roleId) => !StrUtils.isUuid(roleId))) {
        const roles = await db.role.findMany({
          where: {
            name: {
              in: roleIds,
            },
          },
        });

        if (!roles) {
          throw new Error('Role not found');
        }

        roleIds = roles.map((role) => role.id);
      }

      return await db.roleUser.deleteMany({
        where: {
          userId,
          roleId: {
            in: roleIds,
          },
        },
      });
    },
  };
}
