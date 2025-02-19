import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class ClientController {
  @Get()
  getHello(@Res() res: Response): Response {
    return res.json({
      message: 'Welcome to the client service',
      environment: process.env.NODE_ENV,
    });
  }
}
