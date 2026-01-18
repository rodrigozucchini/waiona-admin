import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { ProductAdminService } from '../admin/products.admin.service';
import { CreateProductAdminDto } from './dto/create-product.admin.dto';
import { UpdateProductAdminDto } from './dto/update-product.admin.dto';

@Controller('admin/products')
export class ProductAdminController {
  constructor(private readonly productsService: ProductAdminService) {}

  @Post()
  create(@Body() dto: CreateProductAdminDto) {
    return this.productsService.create(dto);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateProductAdminDto) {
    return this.productsService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.productsService.remove(+id);
  }
}
