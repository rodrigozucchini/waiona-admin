import { IsNumber, Min, IsOptional } from 'class-validator';

export class UpdateMarginDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;
}
