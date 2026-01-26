import {
  IsBoolean,
  IsNumber,
  IsOptional,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';

export class CreateMarginAdminDto {
  // true = porcentaje, false = monto fijo
  @IsBoolean()
  isPercentage: boolean;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @ValidateIf((o) => o.isPercentage === true)
  @Max(100)
  value: number;
}
