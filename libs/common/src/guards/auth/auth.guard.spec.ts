import { AuthGuard } from './auth.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    accessToken: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  })),
}));

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockContext: ExecutionContext;
  let prisma: PrismaClient;

  beforeEach(() => {
    guard = new AuthGuard();
    prisma = new PrismaClient();
    mockContext = createMock<ExecutionContext>();
  });

  it('should pass with valid token', async () => {
    const mockToken = {
      id: '1',
      token: 'valid-token',
      expiresAt: new Date(Date.now() + 3600000),
      user: { id: '1', email: 'test@test.com' },
    };

    (prisma.accessToken.findUnique as jest.Mock).mockResolvedValue(mockToken);

    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('should throw on missing authorization header', async () => {
    mockContext.switchToHttp().getRequest.mockReturnValue({
      headers: {},
    });

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw on expired token', async () => {
    const mockToken = {
      id: '1',
      token: 'expired-token',
      expiresAt: new Date(Date.now() - 3600000),
      user: { id: '1', email: 'test@test.com' },
    };

    (prisma.accessToken.findUnique as jest.Mock).mockResolvedValue(mockToken);

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
