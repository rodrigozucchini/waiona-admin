import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { TaxTypeEntity } from '../../tax-types/entities/tax-type.entity';

@Entity('taxes')
export class TaxEntity extends BaseEntity {
  @ManyToOne(() => TaxTypeEntity)
  @JoinColumn({ name: 'tax_type_id' })
  taxType: TaxTypeEntity;

  @Column('decimal', { precision: 10, scale: 2 })
  value: number;

  // true = porcentaje, false = monto fijo
  @Column()
  isPercentage: boolean;
}