import { IsString, IsNotEmpty } from 'class-validator';

export class CreateDiscountTypeDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}
