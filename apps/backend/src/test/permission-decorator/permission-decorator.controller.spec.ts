import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PermissionDecoratorController } from './permission-decorator.controller';
import { Reflector } from '@nestjs/core';

describe('PermissionDecoratorController', () => {
  let app: INestApplication;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionDecoratorController],
      providers: [Reflector],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', () => {
    const controller = app.get<PermissionDecoratorController>(
      PermissionDecoratorController,
    );
    expect(controller).toBeDefined();
  });

  const permissions = [
    'index',
    'create',
    'show',
    'update',
    'delete',
    'deleted',
    'restore',
  ];

  it('GET /permission-decorator should return 200', () => {
    return request(app.getHttpServer())
      .get('/permission-decorator')
      .expect(200)
      .expect({
        statusCode: 200,
        message: 'Index fetched successfully',
        data: [],
      });
  });

  it('POST /permission-decorator should return 201', () => {
    return request(app.getHttpServer())
      .post('/permission-decorator')
      .expect(201)
      .expect({
        statusCode: 201,
        message: 'Created successfully',
        data: [],
      });
  });

  it('GET /permission-decorator/:id should return 200', () => {
    return request(app.getHttpServer())
      .get('/permission-decorator/1')
      .expect(200)
      .expect({
        statusCode: 200,
        message: 'Show fetched successfully',
        data: [],
      });
  });

  it('PUT /permission-decorator/:id should return 200', () => {
    return request(app.getHttpServer())
      .put('/permission-decorator/1')
      .expect(200)
      .expect({
        statusCode: 200,
        message: 'Updated successfully',
        data: [],
      });
  });

  it('DELETE /permission-decorator/:id should return 200', () => {
    return request(app.getHttpServer())
      .delete('/permission-decorator/1')
      .expect(200)
      .expect({
        statusCode: 200,
        message: 'Deleted successfully',
        data: [],
      });
  });

  it('GET /permission-decorator/deleted should return 200', () => {
    return request(app.getHttpServer())
      .get('/permission-decorator/deleted')
      .expect(200)
      .expect({
        statusCode: 200,
        message: 'Deleted items fetched successfully',
        data: [],
      });
  });

  it('POST /permission-decorator/restore/:id should return 200', () => {
    return request(app.getHttpServer())
      .post('/permission-decorator/restore/1')
      .expect(200)
      .expect({
        statusCode: 200,
        message: 'Restored successfully',
        data: [],
      });
  });
});
