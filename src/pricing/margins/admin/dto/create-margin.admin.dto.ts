import { IsNumber, Min } from 'class-validator';

export class CreateMarginAdminDto {
  // margen en porcentaje (ej: 30 = 30%)
  @IsNumber()
  @Min(0)
  value: number;
}
