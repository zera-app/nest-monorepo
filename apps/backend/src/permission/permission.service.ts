import { DatatableType } from '@common/common/types/datatable';
import { PaginationResponse } from '@common/common/types/pagination';
import { Injectable } from '@nestjs/common';
import {
  PermissionModel,
  PermissionType,
  PrismaService,
} from '@repository/repository';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionService {
  constructor(private prisma: PrismaService) {}

  async getPermissions(
    datatable: DatatableType,
  ): Promise<PaginationResponse<PermissionType>> {
    return await this.prisma.$transaction(async (tx) => {
      return await PermissionModel(tx).findAllPermissions(datatable);
    });
  }

  async createPermission(data: CreatePermissionDto): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      return await PermissionModel(tx).createPermission(data);
    });
  }

  async findOne(id: string): Promise<PermissionType> {
    return await this.prisma.$transaction(async (tx) => {
      return await PermissionModel(tx).findOnePermission(id);
    });
  }

  async updatePermission(id: string, data: UpdatePermissionDto): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      return await PermissionModel(tx).updatePermission(id, data);
    });
  }

  async deletePermission(id: string): Promise<PermissionType> {
    return await this.prisma.$transaction(async (tx) => {
      return await PermissionModel(tx).deletePermission(id);
    });
  }
}
