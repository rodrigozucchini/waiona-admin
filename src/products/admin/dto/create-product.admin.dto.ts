import { IsString, IsOptional, IsEnum, IsNumber, IsArray, IsInt } from 'class-validator';
import { ProductType } from 'src/common/enums/product-type.enum';


export class CreateProductAdminDto {

  @IsString()
  sku: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ProductType)
  type: ProductType;

  @IsNumber()
  basePrice: number;

  // Relaciones por ID
  @IsOptional()
  @IsInt()
  marginId?: number;

  @IsOptional()
  @IsArray()
  taxIds?: number[];
}