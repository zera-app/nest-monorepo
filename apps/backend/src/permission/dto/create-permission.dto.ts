import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  module: string;

  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  name: string[];
}
