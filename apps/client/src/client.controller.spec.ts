import { Test, TestingModule } from '@nestjs/testing';
import { ClientController } from './client.controller';
import { Response } from 'express';

describe('ClientController', () => {
  let clientController: ClientController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ClientController],
      providers: [],
    }).compile();

    clientController = app.get<ClientController>(ClientController);
  });

  describe('root', () => {
    it('should return welcome message', () => {
      const mockResponse = {
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      clientController.getHello(mockResponse);

      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Welcome to the client service',
      });
    });
  });
});
