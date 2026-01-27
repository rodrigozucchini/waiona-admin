import { BaseEntity } from '../../../../common/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, Index } from 'typeorm';
import { DiscountEntity } from './discount.entity';
import { ComboEntity } from 'src/products/combos/entities/combo.entity';
import { ProductEntity } from '../../../../products/entities/product.entity';
import { CouponEntity } from './coupons.entity';
import { DiscountScopeType } from 'src/common/enums/discount-scope-global.enum';

@Entity('discount_scopes')
@Index(['discount', 'scopeType'])
export class DiscountScopeEntity extends BaseEntity {
  // Descuento al que pertenece este scope
  @ManyToOne(() => DiscountEntity, { nullable: false })
  @JoinColumn({ name: 'discount_id' })
  discount: DiscountEntity;

  // Tipo de alcance del descuento (GLOBAL, PRODUCT, COMBO, COUPON, etc)
  @Column({
    type: 'enum',
    enum: DiscountScopeType,
    nullable: false,
  })
  scopeType: DiscountScopeType;

  // Solo si aplica a un producto puntual
  @ManyToOne(() => ProductEntity, { nullable: true })
  @JoinColumn({ name: 'product_id' })
  product?: ProductEntity | null;

  // Solo si aplica a un combo
  @ManyToOne(() => ComboEntity, { nullable: true })
  @JoinColumn({ name: 'combo_id' })
  combo?: ComboEntity | null;

  // Solo si es cupón
  @ManyToOne(() => CouponEntity, { nullable: true })
  @JoinColumn({ name: 'coupon_id' })
  coupon?: CouponEntity | null;
}
