import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { ProductEntity } from '../../products/entities/product.entity';
import { StockMovementType } from '../../common/enums/stock-movement-type.enum';

@Entity('stock_movements')
export class StockMovementEntity extends BaseEntity {

  @ManyToOne(() => ProductEntity, { nullable: false })
  product: ProductEntity;

  @Column({ type: 'int' })
  quantity: number;

  @Column({
    type: 'enum',
    enum: StockMovementType,
  })
  type: StockMovementType;

  @Column({ nullable: true })
  note?: string;
}
