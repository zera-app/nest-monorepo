import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePermissionDto {
  @IsString()
  @IsNotEmpty()
  module: string;

  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  name: string;
}
