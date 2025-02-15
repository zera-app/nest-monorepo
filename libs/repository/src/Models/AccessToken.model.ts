import { StrUtils } from '@utils/utils/string/str.utils';
import { prisma } from '../index';
import { DateUtils } from '@utils/utils';
import { tokenLifeTime } from '@utils/utils/default/token-lifetime';

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
          expiresAt: rememberMe ? null : tokenLifeTime,
          lastUsedAt: DateUtils.now().toDate(),
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
          lastUsedAt: DateUtils.now().toDate(),
        },
      });
    },
  });
}
