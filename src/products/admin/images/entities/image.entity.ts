import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';
import { ProductImageEntity } from './product-image.entity';
import { ComboImageEntity } from './combo-image.entity';



@Entity('images')
export class ImageEntity extends BaseEntity {

  @Column()
  url: string;

  @Column({ default: 0 })
  order: number;

  @OneToMany(() => ComboImageEntity, comboImage => comboImage.image)
  comboImages: ComboImageEntity[];

  @OneToMany(() => ProductImageEntity, productImage => productImage.image)
  productImages: ProductImageEntity[];
}
