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

  async datatable(
    datatable: DatatableType,
  ): Promise<PaginationResponse<PermissionType>> {
    return await this.prisma.$transaction(async (tx) => {
      return await PermissionModel(tx).datatable(datatable);
    });
  }

  async create(data: CreatePermissionDto): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      return await PermissionModel(tx).create(data);
    });
  }

  async findOne(id: string): Promise<PermissionType> {
    return await this.prisma.$transaction(async (tx) => {
      return await PermissionModel(tx).findOne(id);
    });
  }

  async update(id: string, data: UpdatePermissionDto): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await PermissionModel(tx).update(id, data);
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await PermissionModel(tx).delete(id);
    });
  }
}
