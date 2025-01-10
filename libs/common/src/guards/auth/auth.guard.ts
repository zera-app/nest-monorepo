import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

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
      throw new UnauthorizedException('Invalid authorization header');
    }

    const token = authHeader.split(' ')[1];
    const accessToken = await this.prisma.accessToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!accessToken) {
      throw new UnauthorizedException('Invalid token');
    }

    if (accessToken.expiresAt && accessToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Token expired');
    }

    // Update lastUsedAt
    await this.prisma.accessToken.update({
      where: { id: accessToken.id },
      data: { lastUsedAt: new Date() },
    });

    // Attach user to request
    request.user = accessToken.user;
    request.accessToken = accessToken;

    return true;
  }
}
