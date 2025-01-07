import { NestMiddleware } from '@nestjs/common';
import { errorResponse } from '../reponses/error.response';
import { StrUtils } from '@utils/utils/string/str.utils';
import { AccessTokenModel, UserModel } from '@repository/repository';

export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly permissionNames: string[] = []) {}

  async use(req: any, res: any, next: () => void) {
    try {
      const token = req.headers.authorization;
      if (!token || !StrUtils.startsWith(token, 'Bearer ')) {
        throw errorResponse(401, 'Unauthorized');
      }

      const tokenParts = token.split(' ');
      if (tokenParts.length !== 2) {
        return errorResponse(401, 'Unauthorized');
      }

      const accessToken = await AccessTokenModel().findToken(tokenParts[1]);
      if (!accessToken) {
        return errorResponse(401, 'Unauthorized');
      }

      const userInformation = await UserModel().detailProfile(
        accessToken.userId,
      );

      if (!userInformation) {
        return errorResponse(401, 'Unauthorized');
      }

      if (this.permissionNames.length > 0) {
        const hasPermission = userInformation.roles.some((role) =>
          role.role.permissions.some((permission) =>
            this.permissionNames.includes(permission.permission.name),
          ),
        );

        if (!hasPermission) {
          return errorResponse(403, 'Forbidden');
        }
      }

      req.user = userInformation;
    } catch (error) {
      return errorResponse(500, 'Internal Server Error');
    }

    next();
  }
}
