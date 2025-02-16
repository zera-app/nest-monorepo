import { DatatableType } from '@common/common/types/datatable';
import { PaginationResponse } from '@common/common/types/pagination';
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService, UserModel, UserType } from '@repository/repository';
import { CreateUserDto } from './dto/create.dto';
import { HashUtils } from '../../../../libs/utils/src/hash/hash.utils';
import { UserInformation } from '@common/common/types/user-information';
import { UpdateUserDto } from './dto/update.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async datatable(
    datatableRequest: DatatableType,
  ): Promise<PaginationResponse<UserType>> {
    return await this.prisma.$transaction(async (tx) => {
      return await UserModel(tx).datatable(datatableRequest);
    });
  }

  async create(createUserDto: CreateUserDto): Promise<UserInformation> {
    return await this.prisma.$transaction(async (tx) => {
      const userEmailExist = await UserModel(tx).findUserByEmail(
        createUserDto.email,
      );
      if (userEmailExist) {
        throw new UnprocessableEntityException({
          message: 'Email already exist',
          errors: {
            email: ['Email already exist'],
          },
        });
      }

      return await UserModel(tx).create({
        name: createUserDto.name,
        email: createUserDto.email,
        password: HashUtils.generateHash(createUserDto.password),
      });
    });
  }

  async findOne(id: string): Promise<UserInformation> {
    return await this.prisma.$transaction(async (tx) => {
      return await UserModel(tx).detailProfile(id);
    });
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserInformation> {
    return await this.prisma.$transaction(async (tx) => {
      const userEmailExist = await UserModel(tx).findOneByEmail(
        updateUserDto.email,
      );
      if (userEmailExist && userEmailExist.id !== id) {
        throw new UnprocessableEntityException({
          message: 'Email already exist',
          errors: {
            email: ['Email already exist'],
          },
        });
      }

      const updatedData = {
        ...updateUserDto,
        ...(updateUserDto.password && {
          password: HashUtils.generateHash(updateUserDto.password),
        }),
      };

      return await UserModel(tx).update(id, updatedData);
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await UserModel(tx).delete(id);
    });
  }
}
