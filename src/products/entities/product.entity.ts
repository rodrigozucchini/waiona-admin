import { BaseEntity } from '../../common/entities/base.entity';
import { TaxEntity } from '../../pricing/taxes/admin/entities/tax.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { ComboProductEntity } from '../combos/entities/combo-product.entity';
import { ProductType } from '../../common/enums/product-type.enum';
import { ProductImageEntity } from '../images/entities/product-image.entity';
import { MarginEntity } from '../../pricing/margins/entities/margin.entity';
import { CategoryEntity } from '../../categories/entities/category.entity';

@Entity('products')
@Index(['sku'])
@Index(['name'])
export class ProductEntity extends BaseEntity {
  // ================= Datos básicos =================

  @Column({ unique: true, length: 50 })
  sku: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ProductType,
  })
  type: ProductType;

  @Column('decimal', { precision: 10, scale: 2 })
  basePrice: number;

  // ================= Estados =================

  @Column({ default: true })
  isActive: boolean; // se vende o no

  @Column({ default: true })
  isVisible: boolean; // visible en catálogo / ecommerce

  // ================= Relaciones =================

  // Categoría
  @ManyToOne(() => CategoryEntity, { nullable: false })
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;

  // Combos
  @OneToMany(() => ComboProductEntity, (comboProduct) => comboProduct.product)
  combos: ComboProductEntity[];

  // Imágenes
  @OneToMany(() => ProductImageEntity, (productImage) => productImage.product)
  images: ProductImageEntity[];

  // Margen
  @ManyToOne(() => MarginEntity, { nullable: true })
  @JoinColumn({ name: 'margin_id' })
  margin: MarginEntity;

  // Impuestos (SIEMPRE a producto, bien hecho)
  @ManyToMany(() => TaxEntity)
  @JoinTable({
    name: 'product_taxes',
    joinColumn: { name: 'product_id' },
    inverseJoinColumn: { name: 'tax_id' },
  })
  taxes: TaxEntity[];
}
