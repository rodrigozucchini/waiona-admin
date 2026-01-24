import { BaseEntity } from '../../common/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('permissions')
export class PermissionEntity extends BaseEntity {
  @Column({ unique: true })
  key: string; // ej: products.create, users.delete

  @Column()
  description: string;
}
