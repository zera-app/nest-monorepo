import { StrUtils } from '@utils/utils/string/str.utils';
import { prisma } from '../index';

type DetailToken = {
  userId: string;
  expiresAt: Date;
};

export function AccessTokenModel() {
  return Object.assign(prisma, {
    accessToken: prisma.accessToken,

    async createToken(userId: string, rememberMe: boolean): Promise<string> {
      const token = await prisma.accessToken.create({
        data: {
          userId,
          token: StrUtils.random(200),
          expiresAt: rememberMe ? null : new Date(Date.now() + 1000 * 60 * 60),
          lastUsedAt: new Date(),
        },
      });

      return token.token;
    },

    async findToken(token: string): Promise<DetailToken | null> {
      return await prisma.accessToken.findFirst({
        where: {
          token,
        },
        select: {
          userId: true,
          expiresAt: true,
        },
      });
    },

    async updateLastUsed(token: string): Promise<void> {
      await prisma.accessToken.update({
        where: {
          token,
        },
        data: {
          lastUsedAt: new Date(),
        },
      });
    },
  });
}
