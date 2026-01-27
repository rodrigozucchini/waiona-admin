import {
  IsString,
  IsOptional,
  MaxLength,
  IsEnum,
  IsNumber,
  Min,
  IsInt,
  IsArray,
  ArrayUnique,
  ValidateIf,
} from 'class-validator';

import { ProductType } from '../../../common/enums/product-type.enum';
import { MeasureUnit } from '../../../common/enums/measure-unit.enum';

export class UpdateProductAdminDto {
  // ==========================
  // Datos básicos
  // ==========================

  @IsOptional()
  @IsString()
  @MaxLength(50)
  sku?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsEnum(ProductType)
  type?: ProductType;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  basePrice?: number;

  // ==========================
  // Medidas / peso / volumen
  // ==========================

  /**
   * Permite:
   * - cambiar unidad
   * - poner null para eliminarla
   */
  @IsOptional()
  @IsEnum(MeasureUnit)
  measureUnit?: MeasureUnit | null;

  /**
   * Se valida solo si measureUnit NO es null
   * (si es null → se borra la medida)
   */
  @ValidateIf((o) => o.measureUnit !== null && o.measureUnit !== undefined)
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  measureValue?: number | null;

  // ==========================
  // Relaciones
  // ==========================

  /**
   * null → quitar margen
   */
  @IsOptional()
  @IsInt()
  @Min(1)
  marginId?: number | null;

  /**
   * array vacío → quitar todos los impuestos
   */
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  taxIds?: number[];

  /**
   * null → quitar categoría
   */
  @IsOptional()
  @IsInt()
  @Min(1)
  categoryId?: number | null;
}
