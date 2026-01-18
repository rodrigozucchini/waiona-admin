// src/taxes/entities/tax-type.entity.ts

import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../../common/entities/base.entity';

@Entity('tax_types')
export class TaxTypeEntity extends BaseEntity {
  @Column({ unique: true })
  code: string; // IVA, IIBB, ECO, etc

  @Column()
  name: string; // Impuesto al Valor Agregado, Ingresos Brutos, etc
}
