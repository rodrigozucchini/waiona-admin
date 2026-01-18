import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarginAdminService } from './margins.admin.service';
import { MarginAdminController } from './margins.admin.controller';
import { MarginEntity } from './entities/margin.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MarginEntity]),
  ],
  controllers: [MarginAdminController],
  providers: [MarginAdminService],
})
export class MarginsModule {}
