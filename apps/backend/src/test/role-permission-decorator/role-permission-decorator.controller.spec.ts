import { Test, TestingModule } from '@nestjs/testing';
import { RolePermissionDecoratorController } from './role-permission-decorator.controller';

describe('RolePermissionDecoratorController', () => {
  let controller: RolePermissionDecoratorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolePermissionDecoratorController],
    }).compile();

    controller = module.get<RolePermissionDecoratorController>(RolePermissionDecoratorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
