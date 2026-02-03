import { IsInt, Min, IsEnum, IsOptional, IsString } from 'class-validator';
import { StockLossReason } from '../../common/enums/stock-loss-reason.enum';

export class CreateStockLossAdminDto {
    @IsInt()
    @Min(1)
    productId: number;
  
  @IsInt()
  @Min(1)
  quantity: number;
  
    @IsEnum(StockLossReason)
    reason: StockLossReason;
  
    @IsOptional()
    @IsString()
    description?: string;
  }
