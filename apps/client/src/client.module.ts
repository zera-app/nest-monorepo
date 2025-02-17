import { Module } from '@nestjs/common';
import { ClientController } from './client.controller';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ClientController, AuthController],
  providers: [],
})
export class ClientModule {}
