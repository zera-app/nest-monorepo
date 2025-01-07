import { HttpException } from '@nestjs/common';

export const errorResponse = (
  statusCode: number,
  message: string,
): HttpException => {
  const response = {
    code: statusCode,
    success: false,
    message: message,
    data: null,
  };

  return new HttpException(response, statusCode);
};
