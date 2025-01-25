import { Controller, Get, Post, Put, Delete, UseGuards } from '@nestjs/common';
import { Permissions } from '@common/common/decorators/permission.decorator';
import { successResponse } from '@common/common/reponses/success.response';
import { PermissionGuard } from '@common/common/guards/permission/permission.guard';

@Controller('permission-decorator')
@UseGuards(PermissionGuard)
export class PermissionDecoratorController {
  @Get()
  @Permissions(['index'])
  index() {
    return successResponse(200, 'Index fetched successfully', []);
  }

  @Post()
  @Permissions(['create'])
  create() {
    return successResponse(201, 'Created successfully', []);
  }

  @Get(':id')
  @Permissions(['show'])
  show() {
    return successResponse(200, 'Show fetched successfully', []);
  }

  @Put(':id')
  @Permissions(['update'])
  update() {
    return successResponse(200, 'Updated successfully', []);
  }

  @Delete(':id')
  @Permissions(['delete'])
  delete() {
    return successResponse(200, 'Deleted successfully', []);
  }

  @Get('deleted')
  @Permissions(['deleted'])
  deleted() {
    return successResponse(200, 'Deleted items fetched successfully', []);
  }

  @Post('restore/:id')
  @Permissions(['restore'])
  restore() {
    return successResponse(200, 'Restored successfully', []);
  }
}
