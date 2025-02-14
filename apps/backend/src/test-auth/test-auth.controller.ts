import { AuthGuard } from '@common/common/guards/auth/auth.guard';
import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

@Controller('test-auth')
@UseGuards(AuthGuard)
export class TestAuthController {
  @Get('/')
  index(
    @Res() res: Response,
  ) {
    return res.status(200).json({ message: 'Hello World!' });
  }
}
