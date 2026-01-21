import { BaseEntity } from 'src/common/entities/base.entity';
import { PermissionEntity } from 'src/permissions/entities/permission.entity';
import { RoleType } from '../../common/enums/role-type.enum';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';

@Entity('roles')
export class RoleEntity extends BaseEntity {

  @Column({
    type: 'enum',
    enum: RoleType,
    unique: true,
  })
  type: RoleType; // super_admin | admin | manager | operator | client

  @ManyToMany(() => PermissionEntity)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id' },
    inverseJoinColumn: { name: 'permission_id' },
  })
  permissions: PermissionEntity[];
}

