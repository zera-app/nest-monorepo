import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  scope: string;

  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  permissionIds: string[];
}
