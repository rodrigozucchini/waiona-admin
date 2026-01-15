import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarginService } from './margins.service';
import { MarginController } from './margins.controller';
import { MarginEntity } from './entities/margin.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MarginEntity]),
  ],
  controllers: [MarginController],
  providers: [MarginService],
})
export class MarginsModule {}
