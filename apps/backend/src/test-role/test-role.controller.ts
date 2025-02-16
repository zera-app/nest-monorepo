import { Roles } from '@common/common/decorators/role.decorator';
import { RoleGuard } from '@common/common/guards/role/role.guard';
import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

@Controller('test-role')
@UseGuards(RoleGuard)
export class TestRoleController {
  @Get('/')
  @Roles(['admin'])
  index(@Res() res: Response) {
    return res.status(200).json({ message: 'Hello World!' });
  }

  @Get('/invalid-permission')
  @Roles(['superuser'])
  invalidPermission(@Res() res: Response) {
    return res.status(200).json({ message: 'Hello World!' });
  }
}
