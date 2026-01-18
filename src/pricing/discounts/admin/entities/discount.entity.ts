// src/discounts/entities/discount.entity.ts

import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../../common/entities/base.entity';
import { DiscountTypeEntity } from '../../../discount-types/admin/entities/discount-type.entity';

@Entity('discounts')
export class DiscountEntity extends BaseEntity {
  @ManyToOne(() => DiscountTypeEntity)
  @JoinColumn({ name: 'discount_type_id' })
  discountType: DiscountTypeEntity;

  @Column('decimal', { precision: 10, scale: 2 })
  value: number; // 10% o $500

  @Column()
  isPercentage: boolean; // true = %, false = monto fijo
}
