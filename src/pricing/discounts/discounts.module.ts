import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscountsService } from './discounts.service';
import { DiscountsController } from './discounts.controller';
import { DiscountEntity } from './entities/discount.entity';
import { DiscountTypeEntity } from '../discount-types/entities/discount-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DiscountEntity,
      DiscountTypeEntity,
    ]),
  ],
  controllers: [DiscountsController],
  providers: [DiscountsService],
})
export class DiscountsModule {}
