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
  ValidateIf,
} from 'class-validator';

import { ProductType } from '../../../common/enums/product-type.enum';
import { MeasureUnit } from '../../../common/enums/measure-unit.enum';

export class CreateProductAdminDto {
  // ==========================
  // Datos básicos
  // ==========================

  @IsString()
  @MaxLength(50)
  sku: string;

  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsEnum(ProductType)
  type: ProductType;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  basePrice: number;

  // ==========================
  // Medidas / peso / volumen
  // ==========================

  @IsOptional()
  @IsEnum(MeasureUnit)
  measureUnit?: MeasureUnit;

  /**
   * Solo se valida si viene measureUnit
   * Ej: 200 ml, 1.5 kg
   */
  @ValidateIf((o) => o.measureUnit !== undefined)
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  measureValue?: number;

  // ==========================
  // Relaciones
  // ==========================

  @IsOptional()
  @IsInt()
  @Min(1)
  categoryId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  marginId?: number;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  taxIds?: number[];
}
