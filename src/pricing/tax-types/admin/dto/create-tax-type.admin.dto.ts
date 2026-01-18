import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTaxTypeAdminDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}
