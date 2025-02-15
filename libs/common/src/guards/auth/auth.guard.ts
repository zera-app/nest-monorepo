import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UserModel } from '@repository/repository';
import { DateUtils } from '@utils/utils';
import { tokenLifeTime } from '@utils/utils/default/token-lifetime';

@Injectable()
export class AuthGuard implements CanActivate {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Unauthenticated');
    }

    const token = authHeader.split(' ')[1];
    const accessToken = await this.prisma.accessToken.findUnique({
      where: { token },
    });

    if (!accessToken) {
      throw new UnauthorizedException('Invalid token');
    }

    if (
      accessToken.expiresAt !== null &&
      DateUtils.isBefore(
        DateUtils.parse(accessToken.expiresAt.toString()),
        DateUtils.now(),
      )
    ) {
      throw new UnauthorizedException('Token expired');
    }

    await this.prisma.accessToken.update({
      where: { id: accessToken.id },
      data: {
        lastUsedAt: DateUtils.now().toDate(),
        ...(accessToken.expiresAt && { expiresAt: tokenLifeTime }),
      },
    });

    const UserInformation = await UserModel().detailProfile(accessToken.userId);
    request.user = UserInformation;
    request.accessToken = accessToken;

    return true;
  }
}
