import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from '@common/common';
import { RepositoryModule } from '@repository/repository';

@Module({
  imports: [AuthModule, CommonModule, RepositoryModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
