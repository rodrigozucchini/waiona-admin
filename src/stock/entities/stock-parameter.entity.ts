import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { ProductEntity } from '../../products/entities/product.entity';

@Entity('stock_parameters')
export class StockParameterEntity extends BaseEntity {

  @OneToOne(() => ProductEntity, { nullable: false })
  @JoinColumn()
  product: ProductEntity;

  /**
   * Stock mínimo permitido
   */
  @Column({ type: 'int', default: 0 })
  minStock: number;

  /**
   * Stock máximo permitido
   */
  @Column({ type: 'int', nullable: true })
  maxStock?: number;

  /**
   * Umbral de alerta (stock crítico)
   */
  @Column({ type: 'int', default: 0 })
  criticalStock: number;

  /**
   * Permite stock negativo
   */
  @Column({ type: 'boolean', default: false })
  allowNegativeStock: boolean;
}
