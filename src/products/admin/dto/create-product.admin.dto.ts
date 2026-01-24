import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsArray,
  IsInt,
  Min,
  MaxLength,
  ArrayNotEmpty,
  ArrayUnique,
} from 'class-validator';
import { ProductType } from '../../../common/enums/product-type.enum';

export class CreateProductAdminDto {
  @IsString()
  @MaxLength(50)
  sku: string; // SKU único, hasta 50 caracteres

  @IsString()
  @MaxLength(255)
  name: string; // Nombre del producto, hasta 255 caracteres

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string; // Descripción opcional, hasta 500 caracteres

  @IsEnum(ProductType)
  type: ProductType; // Enum ProductType

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  basePrice: number; // Precio base positivo, hasta 2 decimales

  // Relaciones por ID
  @IsOptional()
  @IsInt()
  @Min(1)
  marginId?: number; // ID del margen, entero positivo

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  taxIds?: number[]; // Array de IDs de impuestos, enteros positivos
}
