import { UnifiedGuard } from '@common/common/guards/unified/unified.guard';
import { Controller, Get, Post, Put, Delete, Patch } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';

import { Roles } from '@common/common/decorators/role.decorator';
import { Scope } from '@common/common/decorators/scope.decorator';
import { Permissions } from '@common/common/decorators/permission.decorator';
import { RoleScope } from '@common/common/enum/role-scope.enum';

@Controller('test-rbac')
@UseGuards(UnifiedGuard)
export class TestRbacController {
  @Get()
  @Roles([RoleScope.Admin])
  @Scope('backend')
  @Permissions(['view:test-rbac'])
  async testView() {
    return { message: 'View permission test successful' };
  }

  @Post()
  @Roles([RoleScope.Admin])
  @Scope('backend')
  @Permissions(['create:test-rbac'])
  async testCreate() {
    return { message: 'Create permission test successful' };
  }

  @Put()
  @Roles([RoleScope.Admin])
  @Scope('backend')
  @Permissions(['update:test-rbac'])
  async testUpdate() {
    return { message: 'Update permission test successful' };
  }

  @Delete()
  @Roles([RoleScope.Admin])
  @Scope('backend')
  @Permissions(['delete:test-rbac'])
  async testDelete() {
    return { message: 'Delete permission test successful' };
  }

  @Patch('/restore')
  @Roles([RoleScope.Admin])
  @Scope('backend')
  @Permissions(['restore:test-rbac'])
  async testRestore() {
    return { message: 'Restore permission test successful' };
  }
}
