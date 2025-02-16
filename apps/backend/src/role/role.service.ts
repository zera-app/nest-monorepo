import { DatatableType } from '@common/common/types/datatable';
import { PaginationResponse } from '@common/common/types/pagination';
import { Injectable } from '@nestjs/common';
import {
  PrismaService,
  RoleDatatable,
  RoleDetail,
  roleModel,
} from '@repository/repository';
import { CreateRoleDto } from './dto/create-role.dto';

@Injectable()
export class RoleService {
  constructor(private prismaService: PrismaService) {}

  async datatable(
    datatable: DatatableType,
  ): Promise<PaginationResponse<RoleDatatable>> {
    return await this.prismaService.$transaction(async (tx) => {
      return await roleModel(tx).datatable(datatable);
    });
  }

  async create(data: CreateRoleDto): Promise<void> {
    await this.prismaService.$transaction(async (tx) => {
      return await roleModel(tx).create(data);
    });
  }

  async getRole(id: string): Promise<RoleDetail> {
    return await this.prismaService.$transaction(async (tx) => {
      return await roleModel(tx).findOne(id);
    });
  }

  async update(id: string, data: CreateRoleDto): Promise<void> {
    await this.prismaService.$transaction(async (tx) => {
      return await roleModel(tx).update(id, data);
    });
  }

  async delete(id: string): Promise<void> {
    await this.prismaService.$transaction(async (tx) => {
      return await roleModel(tx).delete(id);
    });
  }
}
