import { User } from '@prisma/client';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    export interface Request {
      user?: User;
    }
  }
}

export {};
