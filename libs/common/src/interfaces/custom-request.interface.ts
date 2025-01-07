import { Request } from 'express';
import { UserInformation } from '../types/user-information';

export interface CustomInterface extends Request {
  user: UserInformation;
}
