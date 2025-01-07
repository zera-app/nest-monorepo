import { prisma } from '../index';

type DetailToken = {
  userId: string;
  expiresAt: Date;
};

export function AccessTokenModel() {
  return Object.assign(prisma, {
    accessToken: prisma.accessToken,

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
