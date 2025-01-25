import { Test, TestingModule } from '@nestjs/testing';
import { RoleDecoratorController } from './role-decorator.controller';

describe('RoleDecoratorController', () => {
  let controller: RoleDecoratorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleDecoratorController],
    }).compile();

    controller = module.get<RoleDecoratorController>(RoleDecoratorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
