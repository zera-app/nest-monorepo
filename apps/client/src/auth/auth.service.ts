import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import {
  AccessTokenModel,
  EmailVerificationModel,
  PrismaService,
  UserModel,
} from '@repository/repository';
import { LoginDto } from './dto/login.dto';
import { HashUtils } from '@utils/utils';
import { UserInformation } from '../../../../libs/common/src/types/user-information';
import { RegisterDto } from './dto/register.dto';
import { MailService } from '@common/common';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async login(
    data: LoginDto,
  ): Promise<{ user: UserInformation; accessToken: string }> {
    const { email, password, remember_me } = data;

    const user = await UserModel(this.prismaService).findUserByEmail(email);
    if (!user) {
      throw new UnprocessableEntityException({
        message: 'Invalid email or password',
        errors: {
          email: ['Invalid email or password'],
        },
      });
    }

    const isMatch = HashUtils.compareHash(password, user.password);
    if (!isMatch) {
      throw new UnprocessableEntityException({
        message: 'Invalid email or password',
        errors: {
          email: ['Invalid email or password'],
        },
      });
    }

    const accessToken = await AccessTokenModel().createToken(
      user.id,
      remember_me,
    );

    const userInformation = await UserModel(this.prismaService).detailProfile(
      user.id,
    );

    return {
      user: userInformation,
      accessToken: accessToken,
    };
  }

  async register(data: RegisterDto): Promise<{ message: string }> {
    return await this.prismaService.$transaction(async (prisma) => {
      const { name, email, password } = data;
      const user = await UserModel(prisma).findUserByEmail(email);
      if (user) {
        throw new UnprocessableEntityException({
          message: 'Email already exists',
          errors: {
            email: ['Email already exists'],
          },
        });
      }

      const hashedPassword = await HashUtils.generateHash(password);
      const createdUser = await UserModel(this.prismaService).create({
        name,
        email,
        password: hashedPassword,
      });

      const emailToken = await EmailVerificationModel(prisma).create({
        userId: createdUser.id,
      });

      await this.mailService.sendMailWithTemplate(
        email,
        'Verify your email',
        '/auth/verify-email',
        {
          name: createdUser.name,
          email: createdUser.email,
          token: emailToken.token,
          url: `${process.env.CLIENT_FRONTEND_APP_URL}/verify-email?token=${emailToken.token}`,
        },
      );

      return {
        message: 'User registered successfully',
      };
    });
  }

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    return await this.prismaService.$transaction(async (prisma) => {
      const user = await UserModel(prisma).findUserByEmail(email);
      if (!user) {
        throw new UnprocessableEntityException({
          message: 'Email not found',
          errors: {
            email: ['Email not found'],
          },
        });
      }

      const emailToken = await EmailVerificationModel(prisma).create({
        userId: user.id,
      });

      await this.mailService.sendMailWithTemplate(
        email,
        'Verify your email',
        '/auth/verify-email',
        {
          name: user.name,
          email: user.email,
          token: emailToken.token,
          url: `${process.env.CLIENT_FRONTEND_APP_URL}/verify-email?token=${emailToken.token}`,
        },
      );

      return {
        message: 'Verification email sent',
      };
    });
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    return await this.prismaService.$transaction(async (prisma) => {
      const emailToken = await EmailVerificationModel(prisma).findToken(token);
      if (!emailToken) {
        throw new UnprocessableEntityException({
          message: 'Invalid token',
          errors: {
            token: ['Invalid token'],
          },
        });
      }

      const user = await UserModel(prisma).findUserByEmail(emailToken.userId);

      await UserModel(prisma).verifyEmail(user.id);

      await prisma.emailVerification.delete({
        where: {
          id: emailToken.id,
        },
      });

      return {
        message: 'Email verified successfully',
      };
    });
  }

  async forgotPassword(email: string) {
    return await this.prismaService.$transaction(async (prisma) => {
      // const user = await UserModel(prisma).findUserByEmail(email);
      // if (!user) {
      //   throw new UnprocessableEntityException({
      //     message: 'Email not found',
      //     errors: {
      //       email: ['Email not found'],
      //     },
      //   });
      // }
      // const emailToken = await EmailVerificationModel(prisma).create({
      //   userId: user.id,
      // });
      // await this.mailService.sendMailWithTemplate(
      //   email,
      //   'Reset your password',
      //   '/auth/reset-password',
      //   {
      //     name: user.name,
      //     email: user.email,
      //     token: emailToken.token,
      //     url: `${process.env.CLIENT_FRONTEND_APP_URL}/reset-password?token=${emailToken.token}`,
      //   },
      // );
      // return {
      //   message: 'Reset password email sent',
      // };
    });
  }
}
