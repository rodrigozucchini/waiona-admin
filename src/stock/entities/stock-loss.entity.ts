import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { ProductEntity } from '../../products/entities/product.entity';
import { StockLossReason } from '../../common/enums/stock-loss-reason.enum';

@Entity('stock_losses')
export class StockLossEntity extends BaseEntity {

  @ManyToOne(() => ProductEntity, { nullable: false })
  product: ProductEntity;

  @Column({ type: 'int' })
  quantity: number;

  @Column({
    type: 'enum',
    enum: StockLossReason,
  })
  reason: StockLossReason;

  @Column({ nullable: true, length: 255 })
  description?: string;
}
