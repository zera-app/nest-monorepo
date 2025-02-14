import { Permissions } from '@common/common/decorators/permission.decorator';
import { Roles } from '@common/common/decorators/role.decorator';
import { PermissionGuard } from '@common/common/guards/permission/permission.guard';
import { RoleGuard } from '@common/common/guards/role/role.guard';
import { successResponse } from '@common/common/reponses/success.response';
import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

@Controller('dashboard')
@UseGuards(RoleGuard)
@UseGuards(PermissionGuard)
export class DashboardController {
  @Get()
  @Permissions(['view:admin-dashboard'])
  @Roles(['superuser'])
  async index(@Res() res: Response) {
    return res.status(200).json(
      successResponse(200, 'Successfully fetched dashboard data', {
        data: 'Dashboard data',
      }),
    );
  }

  @Get('/')
  @Permissions(['view:user-dashboard'])
  @Roles(['user'])
  async userDashboard(@Res() res: Response) {
    return res.status(200).json(
      successResponse(200, 'Successfully fetched user dashboard data', {
        data: 'User dashboard data',
      }),
    );
  }
}
