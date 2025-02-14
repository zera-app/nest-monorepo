import { DatatableType } from '@common/common/types/datatable';
import { PaginationResponse } from '@common/common/types/pagination';
import { Injectable } from '@nestjs/common';
import { UserModel, UserType } from '@repository/repository';
import { CreateUserDto } from './dto/create.dto';
import { HashUtils } from '../../../../libs/utils/src/hash/hash.utils';
import { UserInformation } from '@common/common/types/user-information';

@Injectable()
export class UserService {
  async getUsers(
    datatableRequest: DatatableType,
  ): Promise<PaginationResponse<UserType>> {
    return await UserModel().findAll(datatableRequest);
  }

  async create(createUserDto: CreateUserDto): Promise<UserInformation> {
    return await UserModel().create({
      name: createUserDto.name,
      email: createUserDto.email,
      password: HashUtils.generateHash(createUserDto.password),
    });
  }
}
