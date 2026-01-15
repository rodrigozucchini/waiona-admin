import { IsOptional, IsString } from 'class-validator';

export class UpdateTaxTypeDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;
}
