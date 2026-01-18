import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../../common/entities/base.entity';

@Entity('margins')
export class MarginEntity extends BaseEntity {
  // margen en porcentaje (ej: 30 = 30%)
  @Column('decimal', { precision: 10, scale: 2 })
  value: number;
}
