import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from 'src/common/common-module';
import { UserEntity } from '../entities/user.entity';
import { RoleEntity } from '../../roles/entities/role.entity';

import { UsersAdminService } from './users.admin.service';
import { UsersAdminController } from './users.admin.controller';

@Module({
  imports: [
    CommonModule,
    TypeOrmModule.forFeature([UserEntity, RoleEntity]),
  ],
  providers: [UsersAdminService],
  controllers: [UsersAdminController],
  exports: [UsersAdminService],
})
export class UsersAdminModule {}
