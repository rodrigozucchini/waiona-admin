import { IsOptional, IsString } from 'class-validator';

export class UpdateTaxTypeAdminDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;
}
