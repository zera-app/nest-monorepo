import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { prisma, UserModel } from '@repository/repository';
import { DateUtils } from '@utils/utils';
import { tokenLifeTime } from '@utils/utils/default/token-lifetime';

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
    });

    if (
      !accessToken ||
      (accessToken.expiresAt !== null &&
        DateUtils.isBefore(
          DateUtils.parse(accessToken.expiresAt.toString()),
          DateUtils.now(),
        ))
    ) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const userInformation = await UserModel().detailProfile(accessToken.userId);
    const userRoles = userInformation.roles.map(
      (roleUser) => roleUser.role.name,
    );

    const isSuperuser = userRoles.includes('superuser');
    const hasRole = roles.some((role) => userRoles.includes(role));
    if (!hasRole && !isSuperuser) {
      throw new UnauthorizedException('Insufficient permissions');
    }

    // Update last used timestamp with conditional expiration
    await prisma.accessToken.update({
      where: { id: accessToken.id },
      data: {
        lastUsedAt: DateUtils.now().toDate(),
        ...(accessToken.expiresAt && { expiresAt: tokenLifeTime }),
      },
    });

    request.user = userInformation;
    return true;
  }
}
