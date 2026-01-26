import { IsNotEmpty, IsOptional, IsString, MaxLength, IsInt } from 'class-validator';

export class CreateCategoryAdminDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  // categoría padre (opcional)
  @IsOptional()
  @IsInt()
  parentId?: number;
}
