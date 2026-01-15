import { IsNumber, IsBoolean, Min } from 'class-validator';

export class CreateDiscountDto {
  discountTypeId: number;

  @IsNumber()
  @Min(0)
  value: number;

  @IsBoolean()
  isPercentage: boolean;
}
