import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsInt,
} from 'class-validator';

import { UserStatus } from '../../../common/enums/user-status.enum';

export class UpdateUserAdminDto {
  // ===== PERSON =====

  @IsOptional()
  @IsString()
  @MaxLength(80)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  avatarUrl?: string;

  // ===== USER =====

  @IsOptional()
  @MinLength(8)
  @MaxLength(32)
  password?: string;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsInt()
  roleId?: number;
}
