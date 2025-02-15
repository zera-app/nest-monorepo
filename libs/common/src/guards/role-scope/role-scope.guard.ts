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
    });

    if (
      !accessToken ||
      (accessToken.expiresAt !== null &&
        DateUtils.isBefore(
          DateUtils.parse(accessToken.expiresAt.toString()),
          DateUtils.now(),
        ))
    ) {
      throw new UnauthorizedException('Token expired or invalid');
    }

    // Update lastUsedAt with conditional expiration
    await prisma.accessToken.update({
      where: { id: accessToken.id },
      data: {
        lastUsedAt: DateUtils.now().toDate(),
        ...(accessToken.expiresAt && { expiresAt: tokenLifeTime }),
      },
    });

    // Check if user has any role with the required scope or null scope (all access)
    const userInformation = await UserModel().detailProfile(accessToken.userId);
    const hasScope = userInformation.roles.some(
      (roleUser) =>
        roleUser.role.scope === requiredScope || roleUser.role.scope === null,
    );

    if (!hasScope) {
      throw new UnauthorizedException('Insufficient scope');
    }

    request.user = userInformation;
    return true;
  }
}
