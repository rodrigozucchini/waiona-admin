import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../../common/entities/base.entity';
import { ComboProductEntity } from './combo-product.entity';


@Entity('combos')
export class ComboEntity extends BaseEntity {

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @OneToMany(() => ComboProductEntity, comboProduct => comboProduct.combo)
  products: ComboProductEntity[];
}