import { Prisma } from '@prisma/client';
import { prisma } from '../index';
import { StrUtils } from '@utils/utils';
import { tokenLifeTime } from '@utils/utils/default/token-lifetime';

export type EmailVerificationType = {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

export function EmailVerificationModel(tx?: Prisma.TransactionClient) {
  const db = tx || prisma;

  return Object.assign(db, {
    emailVerification: db.emailVerification,

    async create(data: { userId: string }): Promise<EmailVerificationType> {
      return await db.emailVerification.create({
        data: {
          token: StrUtils.random(200),
          userId: data.userId,
          expiresAt: tokenLifeTime,
        },
      });
    },

    async findToken(token: string): Promise<EmailVerificationType | null> {
      return await db.emailVerification.findFirst({
        where: {
          token,
        },
      });
    },

    async deleteToken(token: string): Promise<EmailVerificationType | null> {
      return await db.emailVerification.delete({
        where: {
          token,
        },
      });
    },
  });
}
