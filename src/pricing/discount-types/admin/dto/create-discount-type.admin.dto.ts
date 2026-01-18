import { IsString, IsNotEmpty } from 'class-validator';

export class CreateDiscountTypeAdminDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}
