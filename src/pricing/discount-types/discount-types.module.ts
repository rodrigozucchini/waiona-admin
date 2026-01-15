import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscountTypeEntity } from './entities/discount-type.entity';
import { DiscountTypesService } from './discount-types.service';
import { DiscountTypesController } from './discount-types.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DiscountTypeEntity])],
  controllers: [DiscountTypesController],
  providers: [DiscountTypesService],
  exports: [DiscountTypesService],
})
export class DiscountTypesModule {}