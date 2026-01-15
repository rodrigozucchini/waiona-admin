import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTaxTypeDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}
