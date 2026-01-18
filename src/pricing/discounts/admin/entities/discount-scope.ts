import { BaseEntity } from "src/common/entities/base.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { DiscountEntity } from "./discount.entity";
import { ComboEntity } from "src/products/admin/combos/entities/combo.entity";
import { ProductEntity } from "src/products/admin/entities/product.entity";
import { CouponEntity } from "./coupons.entity";
import { DiscountScopeType } from "src/common/enums/discount-scope-global.enum";

@Entity('discount_scopes')
export class DiscountScopeEntity extends BaseEntity {

  @ManyToOne(() => DiscountEntity)
  @JoinColumn({ name: 'discount_id' })
  discount: DiscountEntity;

  @Column({
    type: 'enum',
    enum: DiscountScopeType,
  })
  scopeType: DiscountScopeType;

  // solo si aplica a un producto puntual
  @ManyToOne(() => ProductEntity, { nullable: true })
  @JoinColumn({ name: 'product_id' })
  product?: ProductEntity;

  // solo si aplica a un combo
  @ManyToOne(() => ComboEntity, { nullable: true })
  @JoinColumn({ name: 'combo_id' })
  combo?: ComboEntity;

  // solo si es cupón
  @ManyToOne(() => CouponEntity, { nullable: true })
  @JoinColumn({ name: 'coupon_id' })
  coupon?: CouponEntity;
}
