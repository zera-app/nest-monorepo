import { NestFactory } from '@nestjs/core';
import { ClientModule } from './client.module';
import { CustomValidationPipe } from 'apps/backend/src/common/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(ClientModule);
  app.useGlobalPipes(new CustomValidationPipe());

  const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN?.split(',') ?? [
    'http://localhost:3000',
  ];

  const ALLOWED_METHODS = process.env.ALLOWED_METHODS?.split(',') ?? [
    'GET',
    'POST',
    'PUT',
    'DELETE',
    'OPTIONS',
  ];

  const ALLOWED_HEADERS = process.env.ALLOWED_HEADERS?.split(',') ?? [
    'Content-Type',
    'Authorization',
  ];

  app.enableCors({
    origin: ALLOWED_ORIGIN,
    methods: ALLOWED_METHODS,
    allowedHeaders: ALLOWED_HEADERS,
    maxAge: 0,
    credentials: false,
  });

  console.log(`Client is running on: ${process.env.APP_CLIENT_PORT ?? 8002}`);
  await app.listen(process.env.APP_CLIENT_PORT ?? 8002);

  console.log(`Client is running on: ${await app.getUrl()}`);
}
bootstrap();
