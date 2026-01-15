// src/discounts/entities/discount-type.entity.ts

import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('discount_types')
export class DiscountTypeEntity extends BaseEntity {
  @Column({ unique: true })
  code: string; // PROMO, CUPON, BANCO, BLACK_FRIDAY, etc

  @Column()
  name: string; // Promoción, Cupón, Descuento Bancario, etc
}
