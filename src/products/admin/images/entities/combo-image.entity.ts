import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../../common/entities/base.entity';
import { ComboEntity } from '../products/combo.entity';
import { ImageEntity } from './image.entity';

@Entity('combo_images')
export class ComboImageEntity extends BaseEntity {

  @Column()
  comboId: number;

  @Column()
  imageId: number;

  @ManyToOne(() => ComboEntity, { nullable: false })
  @JoinColumn({ name: 'comboId' })
  combo: ComboEntity;

  @ManyToOne(() => ImageEntity, { nullable: false })
  @JoinColumn({ name: 'imageId' })
  image: ImageEntity;
}
