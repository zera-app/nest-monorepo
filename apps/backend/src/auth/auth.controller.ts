import {
  Body,
  Controller,
  Post,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { AccessTokenModel, UserModel } from '@repository/repository';
import { Response } from 'express';
import { errorResponse } from '@common/common/reponses/error.response';
import { HashUtils } from '@utils/utils/hash/hash.utils';
import { successResponse } from '@common/common/reponses/success.response';

@Controller('auth')
export class AuthController {
  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async login(@Body() data: LoginDto, @Res() res: Response) {
    try {
      const { email, password, remember_me } = data;

      const user = await UserModel().findUserByEmail(email);
      if (!user) {
        return errorResponse(422, 'Invalid email or password');
      }

      const isMatch = HashUtils.compareHash(password, user.password);
      if (!isMatch) {
        return errorResponse(422, 'Invalid email or password');
      }

      const accessToken = await AccessTokenModel().createToken(
        user.id,
        remember_me,
      );
      const userInformation = await UserModel().detailProfile(user.id);

      return await res.status(200).json(
        successResponse(200, 'Successfully logged in', {
          user: userInformation,
          accessToken: accessToken,
        }),
      );

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      console.log(error);

      return errorResponse(500, 'Internal Server Error');
    }
  }
}
