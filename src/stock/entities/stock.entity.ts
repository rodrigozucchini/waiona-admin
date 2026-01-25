import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';
import { ProductEntity } from 'src/products/entities/product.entity';

@Entity('stocks')
export class StockEntity extends BaseEntity {

  @OneToOne(() => ProductEntity, { nullable: false })
  @JoinColumn()
  product: ProductEntity;

  @Column({ type: 'int', default: 0 })
  quantity: number;
}
