import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';

import { ImagesAdminService } from './images.admin.service';
import { CreateImageAdminDto } from './dto/create-image.admin.dto';
import { UpdateImageAdminDto } from './dto/update-image.admin.dto';
import { CreateProductImageAdminDto } from './dto/create-product-image.admin.dto';
import { CreateComboImageAdminDto } from './dto/create-combo-image.admin.dto';

@Controller('admin/images')
export class ImagesAdminController {
  constructor(private readonly imagesService: ImagesAdminService) {}

  // =========================
  // Images CRUD
  // =========================

  @Post()
  create(@Body() dto: CreateImageAdminDto) {
    return this.imagesService.create(dto);
  }

  @Get()
  findAll() {
    return this.imagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.imagesService.findOne(id);
  }

  @Put(':id') // <- reemplazado PATCH por PUT
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateImageAdminDto,
  ) {
    return this.imagesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.imagesService.remove(id);
  }

  // =========================
  // Product Images
  // =========================

  @Post('product')
  addImageToProduct(@Body() dto: CreateProductImageAdminDto) {
    return this.imagesService.addImageToProduct(dto);
  }

  @Get('product/:productId')
  getImagesByProduct(
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.imagesService.getImagesByProduct(productId);
  }

  // =========================
  // Combo Images
  // =========================

  @Post('combo')
  addImageToCombo(@Body() dto: CreateComboImageAdminDto) {
    return this.imagesService.addImageToCombo(dto);
  }

  @Get('combo/:comboId')
  getImagesByCombo(@Param('comboId', ParseIntPipe) comboId: number) {
    return this.imagesService.getImagesByCombo(comboId);
  }
}
