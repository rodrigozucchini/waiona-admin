import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CategoryEntity } from './entities/category.entity';
import { CategoriesAdminController } from './admin/categories.admin.controller';
import { CategoriesAdminService } from './admin/categories.admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CategoryEntity]),
  ],
  controllers: [CategoriesAdminController],
  providers: [CategoriesAdminService],
  exports: [
    TypeOrmModule, // opcional pero recomendado
  ],
})
export class CategoriesModule {}
