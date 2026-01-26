import { Module } from '@nestjs/common';
import { CategoriesAdminController } from './admin/categories.admin.controller';
import { CategoriesAdminService } from './admin/categories.admin.service';

@Module({
  controllers: [CategoriesAdminController],
  providers: [CategoriesAdminService]
})
export class CategoriesModule {}
