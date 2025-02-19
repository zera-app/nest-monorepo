import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { errorResponse } from '@common/common/reponses/error.response';
import { Response } from 'express';
import { successResponse } from '@common/common/reponses/success.response';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Res() res: Response, @Body() data: LoginDto) {
    try {
      const result = await this.authService.login(data);
      return res
        .status(200)
        .json(successResponse(200, 'Login success', result));
    } catch (error) {
      return errorResponse(res, error);
    }
  }

  @Post('register')
  async register(@Res() res: Response, @Body() data: RegisterDto) {
    try {
      await this.authService.register(data);
      return res
        .status(200)
        .json(
          successResponse(
            200,
            'Register success, please check your email for verification.',
            null,
          ),
        );
    } catch (error) {
      return errorResponse(res, error);
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Res() res: Response, @Body('email') email: string) {
    try {
      await this.authService.forgotPassword(email);
      return res
        .status(200)
        .json(successResponse(200, 'Reset password email sent', null));
    } catch (error) {
      return errorResponse(res, error);
    }
  }

  @Post('reset-password')
  async resetPassword(
    @Res() res: Response,
    @Body('token') token: string,
    @Body('password') password: string,
  ) {
    try {
      await this.authService.resetPassword(token, password);
      return res
        .status(200)
        .json(successResponse(200, 'Password reset successfully.', null));
    } catch (error) {
      return errorResponse(res, error);
    }
  }

  @Get('verify-email')
  async verifyEmail(@Res() res: Response, @Body('token') token: string) {
    try {
      await this.authService.verifyEmail(token);
      return res
        .status(200)
        .json(successResponse(200, 'Email verified successfully.', null));
    } catch (error) {
      return errorResponse(res, error);
    }
  }

  @Post('resend-email-verification')
  async resendEmailVerification(
    @Res() res: Response,
    @Body('email') email: string,
  ) {
    try {
      await this.authService.resendVerificationEmail(email);
      return res
        .status(200)
        .json(
          successResponse(200, 'Verification email resent successfully.', null),
        );
    } catch (error) {
      return errorResponse(res, error);
    }
  }

  // LOGOUT
  @Post('logout')
  async logout() {}
}
