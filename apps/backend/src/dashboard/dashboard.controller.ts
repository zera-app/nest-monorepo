import { successResponse } from '@common/common/reponses/success.response';
import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('dashboard')
export class DashboardController {
  @Get()
  async index(@Res() res: Response) {
    return res.status(200).json(
      successResponse(200, 'Successfully fetched dashboard data', {
        data: 'Dashboard data',
      }),
    );
  }
}
