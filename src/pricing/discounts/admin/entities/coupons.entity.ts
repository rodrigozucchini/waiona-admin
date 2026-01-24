import { BaseEntity } from '../../../../common/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, Index } from 'typeorm';
import { DiscountEntity } from './discount.entity';

@Entity('coupons')
@Index(['code'], { unique: true })
export class CouponEntity extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    unique: true,
  })
  code: string;

  @ManyToOne(() => DiscountEntity, { nullable: false })
  @JoinColumn({ name: 'discount_id' })
  discount: DiscountEntity;

  @Column({
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @Column({
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  maxUses?: number;

  @Column({
    type: 'int',
    unsigned: true,
    default: 0,
  })
  usedCount: number;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  expiresAt?: Date;
}
