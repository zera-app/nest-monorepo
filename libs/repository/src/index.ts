import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export * from './repository.module';
export * from './repository.service';

export * from './Models/AccessToken.model';
export * from './Models/EmailVerification.model';
export * from './Models/Permission.model';
export * from './Models/Role.model';
export * from './Models/RolePermission.model';
export * from './Models/RoleUser.model';
export * from './Models/User.model';
