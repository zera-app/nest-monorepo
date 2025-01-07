import { StrUtils } from '@utils/utils/string/str.utils';
import { prisma } from '../index';
import { DatatableType } from '@common/common/types/datatable';
import { PaginationResponse } from '@common/common/types/pagination';
import { UserInformation } from '@common/common/types/user-information';

type UserType = {
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

      const where = {
        OR: [
          {
            name: {
              contains: search,
            },
          },
          {
            email: {
              contains: search,
            },
          },
        ],
      };

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
        take: limit,
        skip: (page - 1) * limit,
        orderBy: {
          [sort]: sortDirection,
        },
        select,
      });

      return {
        data: data,
        page: page - 1,
        limit: limit,
        totalCount: await prisma.user.count({ where }),
      };
    },

    async findUserByEmail(email: string) {
      return await prisma.user.findUnique({
        where: {
          email,
        },
      });
    },

    async detailProfile(userId: string): Promise<UserInformation> {
      return await prisma.user.findUnique({
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
                  name: true,
                  permissions: {
                    select: {
                      permission: {
                        select: {
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
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
