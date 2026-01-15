import { IsOptional, IsBoolean, IsNumber, IsPositive, IsInt } from 'class-validator';

export class UpdateTaxDto {
  @IsOptional()
  @IsInt()
  taxTypeId?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  value?: number;

  @IsOptional()
  @IsBoolean()
  isPercentage?: boolean;
}
