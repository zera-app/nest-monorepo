import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { Response } from 'express';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return welcome message', () => {
      const mockResponse = {
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      appController.getHello(mockResponse);

      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Welcome to the backend service',
      });
    });
  });
});
