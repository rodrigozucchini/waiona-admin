import { IsBoolean, IsNumber, IsPositive, IsInt } from 'class-validator';

export class CreateTaxAdminDto {
  @IsInt()
  taxTypeId: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  value: number;

  @IsBoolean()
  isPercentage: boolean;
}
