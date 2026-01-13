import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ProductType } from '../../../common/enums/product-type.enum';
import { ComboProductEntity } from '../../entities/products/combo-product.entity';
import { ProductImageEntity } from '../images/product-image.entity';

@Entity('products')
export class ProductEntity extends BaseEntity {

  @Column()
  sku: string;
    
  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ProductType,
  })
  type: ProductType;

  @OneToMany(() => ComboProductEntity, comboProduct => comboProduct.product)
  combos: ComboProductEntity[];

  @OneToMany(() => ProductImageEntity, productImage => productImage.product)
  images: ProductImageEntity[];
}
