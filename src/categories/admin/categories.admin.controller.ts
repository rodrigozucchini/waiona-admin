import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Delete,
  } from '@nestjs/common';
  import { CategoriesAdminService } from './categories.admin.service';
  import { CreateCategoryAdminDto } from './dto/create-category.admin.dto';
  import { UpdateCategoryAdminDto } from './dto/update-category.admin.dto';
  
  @Controller('admin/categories')
  export class CategoriesAdminController {
    constructor(private readonly categoriesService: CategoriesAdminService) {}
  
    @Post()
    create(@Body() dto: CreateCategoryAdminDto) {
      return this.categoriesService.create(dto);
    }
  
    @Get()
    findAll() {
      return this.categoriesService.findAll();
    }
  
    @Get(':id')
    findOne(@Param('id') id: number) {
      return this.categoriesService.findOne(+id);
    }
  
    @Put(':id')
    update(
      @Param('id') id: number,
      @Body() dto: UpdateCategoryAdminDto,
    ) {
      return this.categoriesService.update(+id, dto);
    }
  
    @Delete(':id')
    remove(@Param('id') id: number) {
      return this.categoriesService.remove(+id);
    }
  }
  