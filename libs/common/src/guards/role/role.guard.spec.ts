import { RoleGuard } from './role.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
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

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let reflector: Reflector;
  let mockContext: ExecutionContext;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RoleGuard(reflector);
    mockContext = createMock<ExecutionContext>();
  });

  it('should be defined', () => {
    expect(new RoleGuard()).toBeDefined();
  });

  it('should pass when no roles are required', async () => {
    jest.spyOn(reflector, 'get').mockReturnValue(null);
    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('should validate user roles correctly', async () => {
    jest.spyOn(reflector, 'get').mockReturnValue(['admin']);

    const mockToken = {
      id: '1',
      token: 'valid-token',
      expiresAt: new Date(Date.now() + 3600000),
      user: {
        roles: [{ role: { name: 'admin' } }],
      },
    };

    (prisma.accessToken.findUnique as jest.Mock).mockResolvedValue(mockToken);

    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('should reject insufficient roles', async () => {
    jest.spyOn(reflector, 'get').mockReturnValue(['admin']);

    const mockToken = {
      id: '1',
      token: 'valid-token',
      expiresAt: new Date(Date.now() + 3600000),
      user: {
        roles: [{ role: { name: 'user' } }],
      },
    };

    (prisma.accessToken.findUnique as jest.Mock).mockResolvedValue(mockToken);

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
