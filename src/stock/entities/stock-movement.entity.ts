import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';
import { ProductEntity } from 'src/products/entities/product.entity';
import { StockMovementType } from 'src/common/enums/stock-movement-type.enum';

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
