import { Module } from '@nestjs/common';
import { ProductAdminService } from './products.admin.service';
import { ProductAdminController } from './products.admin.controller';
import { ImageAdminService } from './images/images/images.admin.service';
import { ComboAdminController } from './combos/combos.admin.controller';
import { ComboAdminService } from './combos/combos.admin.service';

@Module({
  controllers: [ProductAdminController, ComboAdminController],
  providers: [ProductAdminService, ImageAdminService, ComboAdminService],
})
export class ProductsModule {}
