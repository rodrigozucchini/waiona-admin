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
} from 'class-validator';
import { ProductType } from '../../../common/enums/product-type.enum';

export class UpdateProductAdminDto {
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

  @IsOptional()
  @IsInt()
  @Min(1)
  marginId?: number | null;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  taxIds?: number[];
}
