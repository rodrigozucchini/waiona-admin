import { Module } from '@nestjs/common';
import { MarginsService } from './margins.service';
import { MarginsController } from './margins.controller';

@Module({
  controllers: [MarginsController],
  providers: [MarginsService],
})
export class MarginsModule {}
