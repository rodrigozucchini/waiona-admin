import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ProductImageEntity } from './product-image.entity';
import { ComboImageEntity } from './combo-image.entity';

@Entity('images')
export class ImageEntity extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  url: string; // URL de la imagen

  @Column({
    type: 'int',
    default: 0,
    nullable: false,
  })
  order: number; // orden de presentación

  @OneToMany(() => ComboImageEntity, (comboImage) => comboImage.image)
  comboImages: ComboImageEntity[];

  @OneToMany(() => ProductImageEntity, (productImage) => productImage.image)
  productImages: ProductImageEntity[];
}
