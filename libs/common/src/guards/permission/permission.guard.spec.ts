import { PermissionGuard } from './permission.guard';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { prisma } from '@repository/repository';
import { createMock } from '@golevelup/ts-jest';

jest.mock('@repository/repository', () => ({
  prisma: {
    accessToken: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('PermissionGuard', () => {
  let guard: PermissionGuard;
  let reflector: Reflector;
  let mockContext: ExecutionContext;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new PermissionGuard(reflector);
    mockContext = createMock<ExecutionContext>();
  });

  const mockToken = {
    id: '1',
    token: 'valid-token',
    expiresAt: new Date(Date.now() + 3600000),
    user: {
      roles: [
        {
          role: {
            permissions: [
              { permission: { name: 'read' } },
              { permission: { name: 'write' } },
            ],
          },
        },
      ],
    },
  };

  it('should pass when no permissions are required', async () => {
    jest.spyOn(reflector, 'get').mockReturnValue(null);
    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('should validate permissions correctly', async () => {
    jest.spyOn(reflector, 'get').mockReturnValue(['read']);
    (prisma.accessToken.findUnique as jest.Mock).mockResolvedValue(mockToken);

    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('should reject insufficient permissions', async () => {
    jest.spyOn(reflector, 'get').mockReturnValue(['delete']);
    (prisma.accessToken.findUnique as jest.Mock).mockResolvedValue(mockToken);

    const result = await guard.canActivate(mockContext);
    expect(result).toBe(false);
  });

  it('should handle multiple required permissions', async () => {
    jest.spyOn(reflector, 'get').mockReturnValue(['read', 'write']);
    (prisma.accessToken.findUnique as jest.Mock).mockResolvedValue(mockToken);

    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
  });
});
