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
} from 'typeorm';
import { ComboProductEntity } from '../combos/entities/combo-product.entity';
import { ProductType } from '../../common/enums/product-type.enum';
import { ProductImageEntity } from '../images/entities/product-image.entity';
import { MarginEntity } from '../../pricing/margins/admin/entities/margin.entity';

@Entity('products')
export class ProductEntity extends BaseEntity {
  @Column({ unique: true, length: 50 })
  sku: string; // SKU único, hasta 50 caracteres

  @Column({ length: 255 })
  name: string; // Nombre del producto, obligatorio, hasta 255 caracteres

  @Column({ type: 'varchar', length: 500, nullable: true })
  description?: string; // Descripción opcional, hasta 500 caracteres

  @Column({
    type: 'enum',
    enum: ProductType,
  })
  type: ProductType; // Enum: ProductType

  @Column('decimal', { precision: 10, scale: 2 })
  basePrice: number; // Precio base del producto

  // ---------- Relaciones ----------

  // Combos
  @OneToMany(() => ComboProductEntity, (comboProduct) => comboProduct.product)
  combos: ComboProductEntity[];

  // Imágenes
  @OneToMany(() => ProductImageEntity, (productImage) => productImage.product)
  images: ProductImageEntity[];

  // Margen
  @ManyToOne(() => MarginEntity, { nullable: true })
  @JoinColumn({ name: 'margin_id' })
  margin: MarginEntity | null;

  // Impuestos
  @ManyToMany(() => TaxEntity)
  @JoinTable({
    name: 'product_taxes',
    joinColumn: { name: 'product_id' },
    inverseJoinColumn: { name: 'tax_id' },
  })
  taxes: TaxEntity[];
}
