import { StrUtils } from '@utils/utils/string/str.utils';
import { PermissionModel, prisma, roleModel } from '../index';
import { DatatableType } from '@common/common/types/datatable';
import { PaginationResponse } from '@common/common/types/pagination';
import { UserInformation } from '@common/common/types/user-information';
import { HashUtils } from '@utils/utils';
import { BadRequestException, Get } from '@nestjs/common';

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

export function UserModel() {
  return Object.assign(prisma, {
    user: prisma.user,

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

        if (queryParam.filter['createdAt']) {
          filter = {
            ...filter,
            createdAt: {
              gte: new Date(queryParam.filter['createdAt']),
            },
          };
        }

        if (queryParam.filter['updatedAt']) {
          filter = {
            ...filter,
            updatedAt: {
              gte: new Date(queryParam.filter['updatedAt']),
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

      const data = await prisma.user.findMany({
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
        totalCount: await prisma.user.count({ where }),
      };
    },

    async create(data: {
      name: string;
      email: string;
      password: string;
      roles?: string[];
    }): Promise<UserInformation> {
      const newData = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: data.password,
        },
      });

      if (data.roles) {
        const roles = await roleModel().findRoleByName(data.roles);
        await this.assignRolesToUser(
          newData.id,
          roles.map((role) => role.id),
        );
      }

      return await this.detailProfile(newData.id);
    },

    // don't change this for authentication flow
    async findUserByEmail(email: string) {
      return await prisma.user.findUnique({
        where: {
          email,
        },
      });
    },

    async detailProfile(userId: string): Promise<UserInformation> {
      const user = await prisma.user.findUnique({
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

      const rolePermission = await prisma.rolePermission.findMany({
        where: {
          roleId: {
            in: user.roles.map((role) => role.role.id),
          },
        },
      });

      const permission = await prisma.permission.findMany({
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

    // ROLE BASED ACCESS CONTROL (RBAC) ========================

    async assignRoleToUser(userId: string, roleId: string) {
      let finalRoleId = roleId;
      if (!StrUtils.isUuid(roleId)) {
        const role = await prisma.role.findFirst({
          where: {
            name: roleId,
          },
        });
        if (!role) {
          throw new Error('Role not found');
        }

        finalRoleId = role.id;
      }

      return await prisma.roleUser.create({
        data: {
          userId: userId,
          roleId: finalRoleId,
        },
      });
    },

    async assignRolesToUser(userId: string, roleIds: string[]) {
      let finalRoleIds = roleIds;
      if (roleIds.some((roleId) => !StrUtils.isUuid(roleId))) {
        const roles = await prisma.role.findMany({
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

      return await prisma.roleUser.createMany({
        data: finalRoleIds.map((item) => ({
          userId: userId,
          roleId: item,
        })),
      });
    },

    async findUserRoles(userId: string) {
      return await prisma.roleUser.findMany({
        where: {
          userId,
        },
      });
    },

    async revokeRoleFromUser(userId: string, roleId: string) {
      let finalRoleId = roleId;
      if (!StrUtils.isUuid(roleId)) {
        const role = await prisma.role.findFirst({
          where: {
            name: roleId,
          },
        });
        if (!role) {
          throw new Error('Role not found');
        }

        finalRoleId = role.id;
      }

      return await prisma.roleUser.deleteMany({
        where: {
          userId: userId,
          roleId: finalRoleId,
        },
      });
    },

    async revokeRolesFromUser(userId: string, roleIds: string[]) {
      if (roleIds.some((roleId) => !StrUtils.isUuid(roleId))) {
        const roles = await prisma.role.findMany({
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

      return await prisma.roleUser.deleteMany({
        where: {
          userId,
          roleId: {
            in: roleIds,
          },
        },
      });
    },
  });
}
