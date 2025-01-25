import { Module } from '@nestjs/common';
import { RoleDecoratorController } from './role-decorator.controller';

@Module({
  controllers: [RoleDecoratorController]
})
export class RoleDecoratorModule {}
