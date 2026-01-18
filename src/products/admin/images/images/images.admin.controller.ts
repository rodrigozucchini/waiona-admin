import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    Delete,
  } from '@nestjs/common';
  
import { ImageAdminService } from './images.admin.service';
import { CreateImageAdminDto } from '../dto/create-image.admin.dto';
import { UpdateImageAdminDto } from '../dto/update-imageadmin..dto';
import { CreateProductImageAdminDto } from '../dto/create-product-image.admin.dto';
import { CreateComboImageAdminDto } from '../dto/create-combo-image.admin.dto';

  
  @Controller('admin/images')
  export class ImagesController {
    constructor(private readonly imagesService: ImageAdminService) {}
  
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
    findOne(@Param('id') id: number) {
      return this.imagesService.findOne(+id);
    }
  
    @Patch(':id')
    update(@Param('id') id: number, @Body() dto: UpdateImageAdminDto) {
      return this.imagesService.update(+id, dto);
    }
  
    @Delete(':id')
    remove(@Param('id') id: number) {
      return this.imagesService.remove(+id);
    }
  
    // =========================
    // Product Images
    // =========================
  
    @Post('product')
    addImageToProduct(@Body() dto: CreateProductImageAdminDto) {
      return this.imagesService.addImageToProduct(dto);
    }
  
    @Get('product/:productId')
    getImagesByProduct(@Param('productId') productId: number) {
      return this.imagesService.getImagesByProduct(+productId);
    }
  
    // =========================
    // Combo Images
    // =========================
  
    @Post('combo')
    addImageToCombo(@Body() dto: CreateComboImageAdminDto) {
      return this.imagesService.addImageToCombo(dto);
    }
  
    @Get('combo/:comboId')
    getImagesByCombo(@Param('comboId') comboId: number) {
      return this.imagesService.getImagesByCombo(+comboId);
    }
  }
  