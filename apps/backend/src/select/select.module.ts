import { Module } from '@nestjs/common';
import { SelectController } from './select.controller';

@Module({
  controllers: [SelectController],
})
export class SelectModule {}
