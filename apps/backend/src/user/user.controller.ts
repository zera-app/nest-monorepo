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
import { UserService } from './user.service';
import { RoleGuard } from '@common/common/guards/role/role.guard';
import { Roles } from '@common/common/decorators/role.decorator';
import { Response } from 'express';
import { DatatableType, SortDirection } from '@common/common/types/datatable';
import { CreateUserDto } from './dto/create.dto';
import { successResponse } from '@common/common/reponses/success.response';
import { paginationLength } from '@utils/utils/default/pagination-length';
import { defaultSort } from '@utils/utils/default/sort';
import { UpdateUserDto } from './dto/update.dto';
import { errorResponse } from '@common/common/reponses/error.response';

@Controller('user')
@UseGuards(RoleGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles(['superuser'])
  async getUsers(
    @Res() res: Response,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
    @Query('sort') sort: string,
    @Query('sortDirection') sortDirection: string,
    @Query('filter') filter: Record<string, string | boolean | Date> | null,
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

    const users = await this.userService.getUsers(datatableRequest);
    return res
      .status(200)
      .json(successResponse(200, 'Success get user data', users));
  }

  @Post()
  @Roles(['superuser'])
  async createUser(
    @Res() res: Response,
    @Body() createUserDto: CreateUserDto,
  ): Promise<Response> {
    try {
      const data = await this.userService.create(createUserDto);
      return res.status(201).json(successResponse(201, 'User created', data));
    } catch (error) {
      return errorResponse(res, error);
    }
  }

  @Get(':id')
  @Roles(['superuser'])
  async getUser(
    @Res() res: Response,
    @Query('id') id: string,
  ): Promise<Response> {
    try {
      const user = await this.userService.findOne(id);
      return res.json(successResponse(200, 'User found', user));
    } catch (error) {
      return errorResponse(res, error);
    }
  }

  @Put(':id')
  @Roles(['superuser'])
  async updateUser(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() createUserDto: UpdateUserDto,
  ) {
    try {
      const updatedUser = await this.userService.update(id, createUserDto);
      return res.json(successResponse(200, 'User updated', updatedUser));
    } catch (error) {
      return errorResponse(res, error);
    }
  }

  @Delete(':id')
  @Roles(['superuser'])
  async deleteUser(@Res() res: Response, @Param('id') id: string) {
    try {
      await this.userService.delete(id);
      return res.json(successResponse(200, 'User deleted', null));
    } catch (error) {
      return errorResponse(res, error);
    }
  }
}
