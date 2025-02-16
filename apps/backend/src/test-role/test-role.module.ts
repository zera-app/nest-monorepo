import { Module } from '@nestjs/common';
import { TestRoleController } from './test-role.controller';

@Module({
  controllers: [TestRoleController],
})
export class TestRoleModule {}
