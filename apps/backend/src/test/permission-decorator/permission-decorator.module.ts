import { Module } from '@nestjs/common';
import { PermissionDecoratorController } from './permission-decorator.controller';

@Module({
  controllers: [PermissionDecoratorController]
})
export class PermissionDecoratorModule {}
