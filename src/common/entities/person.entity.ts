import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';
import { PersonType } from '../enums/person-type.enum';
import { DocumentType } from '../enums/document-type.enum';

@Entity('persons')
export class PersonEntity extends BaseEntity {
  @Column({ length: 80 })
  firstName: string;

  @Column({ length: 80 })
  lastName: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ nullable: true, length: 20 })
  phoneNumber?: string;

  @Column({ nullable: true, length: 200 })
  address?: string;

  @Column({
    type: 'enum',
    enum: PersonType,
  })
  type: PersonType;
  // NATURAL | COMPANY

  @Column({
    type: 'enum',
    enum: DocumentType,
    nullable: true,
  })
  documentType?: DocumentType;

  @Column({ nullable: true, length: 30 })
  documentNumber?: string;

  @Column({ nullable: true, length: 255 })
  avatarUrl?: string;
}
