import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateRoleDto {
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
