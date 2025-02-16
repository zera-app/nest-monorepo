import {
  ForbiddenException,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { errorResponse } from '../reponses/error.response';
import { StrUtils } from '@utils/utils/string/str.utils';
import { AccessTokenModel, UserModel } from '@repository/repository';
import { DateUtils } from '@utils/utils';

export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly permissionNames: string[] = []) {}

  async use(req: any, res: any, next: () => void) {
    try {
      const token = req.headers.authorization;
      if (!token || !StrUtils.startsWith(token, 'Bearer ')) {
        throw new UnauthorizedException('Unauthenticated');
      }

      const tokenParts = token.split(' ');
      if (tokenParts.length !== 2) {
        throw new UnauthorizedException('Unauthenticated');
      }

      const accessToken = await AccessTokenModel().findToken(tokenParts[1]);
      if (!accessToken) {
        throw new UnauthorizedException('Unauthenticated');
      }

      if (
        accessToken.expiresAt !== null &&
        DateUtils.isBefore(
          DateUtils.parse(accessToken.expiresAt.toISOString()),
          DateUtils.now(),
        )
      ) {
        throw new UnauthorizedException('Unauthenticated');
      }

      const userInformation = await UserModel().detailProfile(
        accessToken.userId,
      );

      if (!userInformation) {
        throw new UnauthorizedException('Unauthenticated');
      }

      if (this.permissionNames.length > 0) {
        const hasPermission = userInformation.permissions.some((permission) =>
          this.permissionNames.includes(permission),
        );

        if (!hasPermission) {
          throw new ForbiddenException('Insufficient Permission');
        }
      }

      req.user = userInformation;
    } catch (error) {
      return errorResponse(res, error);
    }

    next();
  }
}
