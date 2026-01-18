import { BaseEntity } from "src/common/entities/base.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { DiscountEntity } from "./discount.entity";


@Entity('coupons')
export class CouponEntity extends BaseEntity {

  @Column({ unique: true })
  code: string; // BLACK2026, NIKE10, BANCO15

  @ManyToOne(() => DiscountEntity)
  @JoinColumn({ name: 'discount_id' })
  discount: DiscountEntity;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  maxUses?: number;

  @Column({ default: 0 })
  usedCount: number;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;
}
