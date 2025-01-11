import { UserInformation } from './user-information';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    export interface Request {
      user?: UserInformation;
    }
  }
}

export {};
