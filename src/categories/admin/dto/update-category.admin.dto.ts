import { IsOptional, IsString, MaxLength, IsInt } from 'class-validator';

export class UpdateCategoryAdminDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  // cambiar / asignar / quitar categoría padre
  @IsOptional()
  @IsInt()
  parentId?: number | null;
}
