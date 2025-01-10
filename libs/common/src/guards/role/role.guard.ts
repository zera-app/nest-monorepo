import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { prisma } from '@repository/repository';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const bearerToken = request.headers.authorization;

    if (!bearerToken) {
      throw new UnauthorizedException('No token provided');
    }

    const token = bearerToken.replace('Bearer ', '');

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

    if (!accessToken || accessToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const userRoles = accessToken.user.roles.map(
      (roleUser) => roleUser.role.name,
    );
    const hasRole = roles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      throw new UnauthorizedException('Insufficient permissions');
    }

    // Update last used timestamp
    await prisma.accessToken.update({
      where: { id: accessToken.id },
      data: { lastUsedAt: new Date() },
    });

    return true;
  }
}
