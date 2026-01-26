import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarginsAdminService } from './admin/margins.admin.service';
import { MarginsAdminController } from './admin/margins.admin.controller';
import { MarginEntity } from './entities/margin.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MarginEntity])],
  controllers: [MarginsAdminController],
  providers: [MarginsAdminService],
  exports: [MarginsAdminService, TypeOrmModule], // 👈 exportar para que otros módulos vean el repositorio
})
export class MarginsModule {}
