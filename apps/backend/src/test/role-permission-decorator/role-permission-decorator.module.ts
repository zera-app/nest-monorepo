import { Module } from '@nestjs/common';
import { RolePermissionDecoratorController } from './role-permission-decorator.controller';

@Module({
  controllers: [RolePermissionDecoratorController]
})
export class RolePermissionDecoratorModule {}
