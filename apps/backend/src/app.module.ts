import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from '@common/common';
import { RepositoryModule } from '@repository/repository';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [AuthModule, CommonModule, RepositoryModule, DashboardModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
