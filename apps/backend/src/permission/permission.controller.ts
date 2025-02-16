import { Roles } from '@common/common/decorators/role.decorator';
import { RoleGuard } from '@common/common/guards/role/role.guard';
import { DatatableType, SortDirection } from '@common/common/types/datatable';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { PermissionService } from './permission.service';
import { successResponse } from '@common/common/reponses/success.response';
import { errorResponse } from '@common/common/reponses/error.response';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { paginationLength } from '@utils/utils/default/pagination-length';
import { defaultSort } from '@utils/utils/default/sort';

@Controller('permission')
@UseGuards(RoleGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  @Roles(['superuser'])
  async datatable(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
    @Query('sort') sort: string,
    @Query('sortDirection') sortDirection: string,
    @Query('filter') filter: Record<string, string | boolean | Date> | null,
    @Res() res: Response,
  ) {
    const datatableRequest: DatatableType = {
      page: page || 1,
      limit: limit || paginationLength,
      search: search || null,
      sort: sort || defaultSort,
      sortDirection: (sortDirection === 'asc'
        ? 'asc'
        : 'desc') as SortDirection,
      filter: filter || null,
    };

    try {
      const data = await this.permissionService.datatable(datatableRequest);
      return res
        .status(200)
        .json(successResponse(200, 'Success get permissions', data));
    } catch (error) {
      return errorResponse(res, error);
    }
  }

  @Post()
  @Roles(['superuser'])
  async createPermission(
    @Body() data: CreatePermissionDto,
    @Res() res: Response,
  ) {
    try {
      await this.permissionService.create(data);
      return res
        .status(201)
        .json(successResponse(201, 'Success create permission', null));
    } catch (error) {
      return errorResponse(res, error);
    }
  }

  @Get(':id')
  @Roles(['superuser'])
  async findOne(@Param('id') id: string, @Res() res: Response) {
    try {
      const data = await this.permissionService.findOne(id);
      return res
        .status(200)
        .json(successResponse(200, 'Success get permission', data));
    } catch (error) {
      return errorResponse(res, error);
    }
  }

  @Put(':id')
  @Roles(['superuser'])
  async updatePermission(
    @Param('id') id: string,
    @Body() data: UpdatePermissionDto,
    @Res() res: Response,
  ) {
    try {
      await this.permissionService.update(id, data);
      return res
        .status(200)
        .json(successResponse(200, 'Success update permission', null));
    } catch (error) {
      return errorResponse(res, error);
    }
  }

  @Delete(':id')
  @Roles(['superuser'])
  async deletePermission(@Param('id') id: string, @Res() res: Response) {
    try {
      await this.permissionService.delete(id);
      return res
        .status(200)
        .json(successResponse(200, 'Success delete permission', null));
    } catch (error) {
      return errorResponse(res, error);
    }
  }
}
