import { prisma } from '../index';

export function EmailVerificationModel() {
  return Object.assign(prisma, {
    emailVerification: prisma.emailVerification,
  });
}
