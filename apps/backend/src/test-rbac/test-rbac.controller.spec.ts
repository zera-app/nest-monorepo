import { Test, TestingModule } from '@nestjs/testing';
import { TestRbacController } from './test-rbac.controller';

describe('TestRbacController', () => {
  let controller: TestRbacController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestRbacController],
    }).compile();

    controller = module.get<TestRbacController>(TestRbacController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
