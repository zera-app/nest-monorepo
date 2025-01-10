import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { prisma } from '@repository/repository';
import { Request } from 'express';
import '../../types/express';

@Injectable()
export class UnifiedGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    const requiredScope = this.reflector.get<string>(
      'scope',
      context.getHandler(),
    );
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );

    // If no requirements are set, allow access
    if (!roles && !requiredScope && !requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    const accessToken = await prisma.accessToken.findUnique({
      where: { token },
      include: {
        user: {
          include: {
            roles: {
              include: {
                role: {
                  include: {
                    permissions: {
                      include: {
                        permission: true,
                      },
                    },
                  },
                },
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
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Update lastUsedAt
    await prisma.accessToken.update({
      where: { id: accessToken.id },
      data: { lastUsedAt: new Date() },
    });

    // Check roles if required
    if (roles) {
      const userRoles = accessToken.user.roles.map(
        (roleUser) => roleUser.role.name,
      );
      const hasRole = roles.some((role) => userRoles.includes(role));
      if (!hasRole) {
        throw new UnauthorizedException('Insufficient roles');
      }
    }

    // Check scope if required
    if (requiredScope) {
      const hasScope = accessToken.user.roles.some(
        (roleUser) =>
          roleUser.role.scope === requiredScope || roleUser.role.scope === null,
      );
      if (!hasScope) {
        throw new UnauthorizedException('Insufficient scope');
      }
    }

    // Check permissions if required
    if (requiredPermissions) {
      const userPermissions = new Set<string>();
      accessToken.user.roles.forEach((roleUser) => {
        roleUser.role.permissions.forEach((rolePermission) => {
          userPermissions.add(rolePermission.permission.name);
        });
      });

      const hasPermissions = requiredPermissions.every((permission) =>
        userPermissions.has(permission),
      );
      if (!hasPermissions) {
        throw new UnauthorizedException('Insufficient permissions');
      }
    }

    // Attach user to request
    request.user = accessToken.user;
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
