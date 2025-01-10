import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { prisma } from '@repository/repository';

@Injectable()
export class RoleScopeGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredScope = this.reflector.get<string>(
      'scope',
      context.getHandler(),
    );
    if (!requiredScope) return true;

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid token');
    }

    const token = authHeader.substring(7);

    const accessToken = await prisma.accessToken.findUnique({
      where: { token },
      include: {
        user: {
          include: {
            roles: {
              include: {
                role: true,
              },
            },
          },
        },
      },
    });

    if (
      !accessToken ||
      (accessToken.expiresAt && accessToken.expiresAt < new Date())
    ) {
      throw new UnauthorizedException('Token expired or invalid');
    }

    // Update lastUsedAt
    await prisma.accessToken.update({
      where: { id: accessToken.id },
      data: { lastUsedAt: new Date() },
    });

    // Check if user has any role with the required scope or null scope (all access)
    const hasScope = accessToken.user.roles.some(
      (roleUser) =>
        roleUser.role.scope === requiredScope || roleUser.role.scope === null,
    );

    if (!hasScope) {
      throw new UnauthorizedException('Insufficient scope');
    }

    request.user = accessToken.user;
    return true;
  }
}
