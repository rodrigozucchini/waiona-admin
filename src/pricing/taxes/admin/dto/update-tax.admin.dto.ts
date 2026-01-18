import { IsOptional, IsBoolean, IsNumber, IsPositive, IsInt } from 'class-validator';

export class UpdateTaxAdminDto {
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
