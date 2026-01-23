import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionEntity } from './entities/permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PermissionEntity]),
  ],
  exports: [
    TypeOrmModule, // 🔥 CLAVE
  ],
})
export class PermissionsModule {}

