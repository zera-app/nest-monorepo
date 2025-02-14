import {
  Body,
  Controller,
  Get,
  Post,
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
    return res.json(users);
  }

  @Post()
  @Roles(['superuser'])
  async createUser(
    @Res() res: Response,
    @Body() createUserDto: CreateUserDto,
  ): Promise<Response> {
    const data = await this.userService.create(createUserDto);

    return res.status(201).json(successResponse(201, 'User created', data));
  }
}
