import { UnifiedGuard } from './unified.guard';
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

describe('UnifiedGuard', () => {
  let guard: UnifiedGuard;
  let reflector: Reflector;
  let mockContext: ExecutionContext;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new UnifiedGuard(reflector);
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
            name: 'admin',
            scope: 'global',
            permissions: [
              { permission: { name: 'read' } },
              { permission: { name: 'write' } },
            ],
          },
        },
      ],
    },
  };

  it('should pass when no requirements are set', async () => {
    jest.spyOn(reflector, 'get').mockReturnValue(null);
    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('should validate roles correctly', async () => {
    jest
      .spyOn(reflector, 'get')
      .mockReturnValueOnce(['admin']) // roles
      .mockReturnValueOnce(null) // scope
      .mockReturnValueOnce(null); // permissions

    (prisma.accessToken.findUnique as jest.Mock).mockResolvedValue(mockToken);

    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('should validate permissions correctly', async () => {
    jest
      .spyOn(reflector, 'get')
      .mockReturnValueOnce(null) // roles
      .mockReturnValueOnce(null) // scope
      .mockReturnValueOnce(['read']); // permissions

    (prisma.accessToken.findUnique as jest.Mock).mockResolvedValue(mockToken);

    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('should validate scope correctly', async () => {
    jest
      .spyOn(reflector, 'get')
      .mockReturnValueOnce(null) // roles
      .mockReturnValueOnce('global') // scope
      .mockReturnValueOnce(null); // permissions

    (prisma.accessToken.findUnique as jest.Mock).mockResolvedValue(mockToken);

    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('should throw on invalid token', async () => {
    jest.spyOn(reflector, 'get').mockReturnValue(['admin']);
    (prisma.accessToken.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
