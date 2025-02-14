import { UserInformation } from '@common/common/types/user-information';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { prisma, UserModel } from '@repository/repository';
import { Request } from 'express';

declare module 'express' {
  interface Request {
    user?: UserInformation;
  }
}

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );
    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    const accessToken = await prisma.accessToken.findUnique({
      where: { token },
    });

    if (
      !accessToken ||
      (accessToken.expiresAt && accessToken.expiresAt < new Date())
    ) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    await prisma.accessToken.update({
      where: { id: accessToken.id },
      data: { lastUsedAt: new Date() },
    });

    const userInformation = await UserModel().detailProfile(accessToken.userId);
    const userPermissions = new Set<string>();

    const isSuperuser = userInformation.roles.some(({role}) => role.name === 'superuser');

    userInformation.permissions.forEach((permission) => {
      userPermissions.add(permission);
    });

    const isHasValidPermission = requiredPermissions.every((permission) =>
      userPermissions.has(permission),
    );

    if (!isHasValidPermission && !isSuperuser) {
      throw new ForbiddenException('Insufficient permissions');
    }

    request.user = userInformation;
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
