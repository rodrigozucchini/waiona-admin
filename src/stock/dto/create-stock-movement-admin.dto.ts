import { IsInt, Min, IsEnum, IsOptional, IsString } from 'class-validator';
import { StockMovementType } from '../../common/enums/stock-movement-type.enum';

export class CreateStockMovementAdminDto {
  @IsInt()
  @Min(1)
  productId: number;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsEnum(StockMovementType)
  type: StockMovementType;

  @IsOptional()
  @IsString()
  note?: string;
}
