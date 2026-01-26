import {
    Entity,
    Column,
    Index,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { ProductEntity } from '../../products/entities/product.entity';
  
  @Entity('categories')
  @Index(['name'])
  export class CategoryEntity extends BaseEntity {
    // ==========================
    // Datos básicos
    // ==========================
  
    @Column({ length: 100, unique: true })
    name: string;
  
    @Column({ length: 255, nullable: true })
    description?: string;
  
    @Column({ default: true })
    isActive: boolean;
  
    // ==========================
    // Jerarquía (categorías)
    // ==========================
  
    @ManyToOne(() => CategoryEntity, (category) => category.children, {
      nullable: true,
    })
    @JoinColumn({ name: 'parent_id' })
    parent: CategoryEntity | null;
  
    @OneToMany(() => CategoryEntity, (category) => category.parent)
    children: CategoryEntity[];
  
    // ==========================
    // Productos
    // ==========================
  
    @OneToMany(() => ProductEntity, (product) => product.category)
    products: ProductEntity[];
  }
  