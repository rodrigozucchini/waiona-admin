import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../../common/entities/base.entity';
import { ProductEntity } from '../../entities/product.entity';
import { ImageEntity } from './image.entity';

@Entity('product_images')
export class ProductImageEntity extends BaseEntity {

  @Column()
  productId: number;

  @Column()
  imageId: number;

  @ManyToOne(() => ProductEntity, product => product.images, { nullable: false })
  @JoinColumn({ name: 'productId' })
  product: ProductEntity;

  @ManyToOne(() => ImageEntity, image => image.productImages, { nullable: false })
  @JoinColumn({ name: 'imageId' })
  image: ImageEntity;
}
