import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscountAdminService } from './discounts.admin.service';
import { DiscountAdminController } from './discounts.admin.controller';
import { DiscountEntity } from './entities/discount.entity';
import { DiscountTypeEntity } from '../../discount-types/admin/entities/discount-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DiscountEntity,
      DiscountTypeEntity,
    ]),
  ],
  controllers: [DiscountAdminController],
  providers: [DiscountAdminService],
})
export class DiscountsModule {}
