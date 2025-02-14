import { Module } from '@nestjs/common';
import { TestPermissionController } from './test-permission.controller';

@Module({
  controllers: [TestPermissionController]
})
export class TestPermissionModule {}
