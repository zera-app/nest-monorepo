import { HttpException, UnprocessableEntityException } from '@nestjs/common';
import { DateUtils } from '@utils/utils';
import { Response } from 'express';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const errorResponse = (res: Response, error: any) => {
  const date = DateUtils.now().format('YYYY-MM-DD HH:mm:ss');

  console.log(`=============${date}==================`);
  console.log(error);
  console.log(`=======================================\n`);

  if (error instanceof HttpException) {
    if (error instanceof UnprocessableEntityException) {
      return res.status(422).json({
        statusCode: 422,
        ...(error.getResponse() as Record<string, unknown>),
      });
    }

    const status = error.getStatus();
    const message = error.getResponse();

    return res.status(status).json({
      statusCode: status,
      message: message,
    });
  }

  return res.status(500).json({
    statusCode: 500,
    message: 'Internal Server Error',
  });
};
