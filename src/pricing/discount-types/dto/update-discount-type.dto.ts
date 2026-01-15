import { IsOptional, IsString } from 'class-validator';

export class UpdateDiscountTypeDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;
}
