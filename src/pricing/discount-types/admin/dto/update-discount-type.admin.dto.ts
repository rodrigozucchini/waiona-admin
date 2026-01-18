import { IsOptional, IsString } from 'class-validator';

export class UpdateDiscountTypeAdminDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;
}
