import { IsString, MinLength, MaxLength } from 'class-validator';

export class ResetPasswordAdminDto {

  @IsString()
  @MinLength(8)
  @MaxLength(32)
  newPassword: string;
}
