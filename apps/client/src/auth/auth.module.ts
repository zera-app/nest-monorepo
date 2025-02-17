import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MailService } from '@common/common/mail/mail.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, MailService],
})
export class AuthModule {}
