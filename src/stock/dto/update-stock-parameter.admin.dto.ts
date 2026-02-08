import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateStockParameterAdminDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  minStock?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxStock?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  criticalStock?: number;

  @IsOptional()
  @IsBoolean()
  allowNegativeStock?: boolean;
}
