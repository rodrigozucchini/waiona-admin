import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Put,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { ProductsAdminService } from '../admin/products.admin.service';
import { CreateProductAdminDto } from './dto/create-product.admin.dto';
import { UpdateProductAdminDto } from './dto/update-product.admin.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('admin/products')
export class ProductsAdminController {
  constructor(private readonly productsService: ProductsAdminService) {}

  @Post()
  create(@Body() dto: CreateProductAdminDto) {
    return this.productsService.create(dto);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductAdminDto,
  ) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
