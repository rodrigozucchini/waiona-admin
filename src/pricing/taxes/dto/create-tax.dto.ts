import { IsBoolean, IsNumber, IsPositive, IsInt } from 'class-validator';

export class CreateTaxDto {
  @IsInt()
  taxTypeId: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  value: number;

  @IsBoolean()
  isPercentage: boolean;
}
