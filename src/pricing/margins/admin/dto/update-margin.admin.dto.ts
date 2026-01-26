import {
  IsBoolean,
  IsNumber,
  IsOptional,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';

export class UpdateMarginAdminDto {
  @IsOptional()
  @IsBoolean()
  isPercentage?: boolean;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @ValidateIf((o) => o.isPercentage === true)
  @Max(100)
  value?: number;
}
