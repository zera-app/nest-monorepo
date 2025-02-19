import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from '@common/common';
import { RepositoryModule } from '@repository/repository';
import { DashboardModule } from './dashboard/dashboard.module';
import { TestAuthModule } from './test-auth/test-auth.module';
import { TestRoleModule } from './test-role/test-role.module';
import { TestPermissionModule } from './test-permission/test-permission.module';
import { UserModule } from './user/user.module';
import { PermissionModule } from './permission/permission.module';
import { RoleModule } from './role/role.module';
import { SelectModule } from './select/select.module';

@Module({
  imports: [
    AuthModule,
    CommonModule,
    RepositoryModule,
    DashboardModule,
    TestAuthModule,
    TestRoleModule,
    TestPermissionModule,
    UserModule,
    PermissionModule,
    RoleModule,
    SelectModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
