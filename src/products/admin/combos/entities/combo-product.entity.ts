import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../../common/entities/base.entity';
import { ProductEntity } from '../../entities/product.entity';
import { ComboEntity } from './combo.entity';

@Entity('combo_products')
export class ComboProductEntity extends BaseEntity {

  @Column()
  comboId: number;

  @Column()
  productId: number;

  @ManyToOne(() => ComboEntity, combo => combo.products, { nullable: false })
  @JoinColumn({ name: 'comboId' })
  combo: ComboEntity;

  @ManyToOne(() => ProductEntity, product => product.combos, { nullable: false })
  @JoinColumn({ name: 'productId' })
  product: ProductEntity;

  @Column({ type: 'int', default: 1 })
  quantity: number;
}