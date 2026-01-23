import {
    Entity,
    Column,
    OneToOne,
    JoinColumn,
    ManyToOne,
    Index,
    BeforeInsert,
  } from 'typeorm';

  import * as bcrypt from 'bcrypt';
  
  import { BaseEntity } from 'src/common/entities/base.entity';
  import { PersonEntity } from '../../common/entities/person.entity';
  import { UserStatus } from '../../common/enums/user-status.enum';
  import { RoleEntity } from 'src/roles/entities/role.entity';
import { Exclude } from 'class-transformer';
  
  @Entity('users')
  @Index(['person'], { unique: true }) // una persona = un usuario
  export class UserEntity extends BaseEntity {
  
    // ================= RELATIONS =================
  
    @OneToOne(() => PersonEntity, { eager: true, nullable: false })
    @JoinColumn({ name: 'person_id' })
    person: PersonEntity;
  
  
    @ManyToOne(() => RoleEntity, { eager: true, nullable: false })
    @JoinColumn({ name: 'role_id' })
    role: RoleEntity;
  
  
    // ================= SECURITY =================
  
    // bcrypt hash -> 60 chars aprox, dejamos margen
    @Exclude()
    @Column({ length: 255, nullable: false })
    password: string;
  
  
    // ================= STATUS =================
  
    @Column({
      type: 'enum',
      enum: UserStatus,
      default: UserStatus.ACTIVE,
      nullable: false,
    })
    status: UserStatus;
  
  
    // ================= METADATA =================
  
    @Column({ default: false })
    emailVerified: boolean;
  
    @Column({ type: 'timestamp', nullable: true })
    lastLoginAt?: Date;


    // ================= FOR PASSWORD =============
    @BeforeInsert()
    async hasPassword() {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
  