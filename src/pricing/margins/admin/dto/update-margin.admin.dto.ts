import { IsNumber, Min, IsOptional } from 'class-validator';

export class UpdateMarginAdminDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;
}
