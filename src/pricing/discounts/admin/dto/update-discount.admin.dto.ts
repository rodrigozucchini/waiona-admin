import { IsOptional, IsNumber, IsBoolean, Min } from 'class-validator';

export class UpdateDiscountAdminDto {
  @IsOptional()
  discountTypeId?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @IsOptional()
  @IsBoolean()
  isPercentage?: boolean;
}
