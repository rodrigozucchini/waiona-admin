import { StockLossReason } from '../../common/enums/stock-loss-reason.enum';

export class StockLossResponseAdminDto {
  id: number;
  productId: number;
  quantity: number;
  reason: StockLossReason;
  description?: string;

  createdAt: Date;
}
