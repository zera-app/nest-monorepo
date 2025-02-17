import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { MailModule } from './mail/mail.module';

@Module({
  providers: [CommonService],
  exports: [CommonService],
  imports: [MailModule],
})
export class CommonModule {}
