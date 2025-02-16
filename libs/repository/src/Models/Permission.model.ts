import { DatatableType, SortDirection } from '@common/common/types/datatable';
import { prisma } from '../index';
import { PaginationResponse } from '@common/common/types/pagination';
import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export type PermissionType = {
  id: string;
  name: string;
  module: string;
  createdAt: Date;
  updatedAt: Date;
};

export function PermissionModel(tx?: Prisma.TransactionClient) {
  const db = tx || prisma;

  return Object.assign(db, {
    permission: db.permission,

    async findAllPermissions(
      datatable: DatatableType,
    ): Promise<PaginationResponse<PermissionType>> {
      const { page, limit, search, sortDirection, filter } = datatable;
      const finalLimit = Number(limit);
      const finalPage = Number(page);

      const allowedSort = ['name', 'module', 'createdAt', 'updatedAt'];
      const allowedSortDirection = ['asc', 'desc'];
      const allowedFilter = ['name', 'module'];

      if (!allowedSort.includes(datatable.sort)) {
        throw new BadRequestException('Invalid sort');
      }

      if (!allowedSortDirection.includes(sortDirection)) {
        throw new BadRequestException('Invalid sort direction');
      }

      if (datatable.filter) {
        for (const key in datatable.filter) {
          if (!allowedFilter.includes(key)) {
            throw new BadRequestException('Invalid filter');
          }
        }
      }

      let where = {};
      if (search) {
        where = {
          name: {
            contains: search,
            mode: 'insensitive',
          },
          module: {
            contains: search,
            mode: 'insensitive',
          },
        };
      }

      if (datatable.filter['name']) {
        where = {
          ...where,
          name: {
            equal: datatable.filter['name'],
          },
        };
      }

      if (datatable.filter['module']) {
        where = {
          ...where,
          module: {
            equal: datatable.filter['module'],
          },
        };
      }

      const data = await this.db.permission.findMany({
        where,
        orderBy: {
          [datatable.sort]: sortDirection as SortDirection,
        },
        skip: finalLimit * (finalPage - 1),
        take: finalLimit,
        select: {
          id: true,
          name: true,
          module: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const total = await this.db.permission.count({
        where,
      });

      return {
        data,
        limit: finalLimit,
        page: finalPage - 1,
        totalCount: total,
      };
    },

    async createPermission(data: {
      name: string[];
      module: string;
    }): Promise<void> {
      const permissions = data.name.map((name) => ({
        name,
        module: data.module,
      }));

      await prisma.permission.createMany({
        data: permissions,
      });
    },

    async findOnePermission(id: string): Promise<PermissionType> {
      return await prisma.permission.findUnique({
        where: {
          id,
        },
      });
    },

    async updatePermission(
      id: string,
      data: { name: string; module: string },
    ): Promise<PermissionType> {
      return await prisma.permission.update({
        where: {
          id,
        },
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
