import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscountTypeEntity } from './entities/discount-type.entity';
import { DiscountTypeAdminService } from './discount-types.admin.service';
import { DiscountTypeAdminController } from './discount-types.admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DiscountTypeEntity])],
  controllers: [DiscountTypeAdminController],
  providers: [DiscountTypeAdminService],
  exports: [DiscountTypeAdminService],
})
export class DiscountTypesModule {}