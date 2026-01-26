import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('margins')
@Index(['isPercentage'])
export class MarginEntity extends BaseEntity {
  // valor del margen: 30.00 (30%) o 500.00 (monto fijo)
  @Column('decimal', {
    precision: 10,
    scale: 2,
    nullable: false,
  })
  value: number;

  // true = porcentaje, false = monto fijo
  @Column({
    type: 'boolean',
    default: true,
    nullable: false,
  })
  isPercentage: boolean;
}

