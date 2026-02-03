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

import { CombosAdminService } from './combos.admin.service';
import { CreateComboAdminDto } from './dto/create-combo.admin.dto';
import { UpdateComboAdminDto } from './dto/update-combo.admin.dto';
import { UpdateComboProductAdminDto } from './dto/update-combo-product.admin.dto';
import { CreateProductToComboAdminDto } from './dto/create-product-combo.admin.dto';

@Controller('admin/combos')
export class CombosAdminController {
  constructor(private readonly combosService: CombosAdminService) {}

  // =========================
  // Combos CRUD
  // =========================

  @Post()
  create(@Body() dto: CreateComboAdminDto) {
    return this.combosService.create(dto);
  }

  @Get()
  findAll() {
    return this.combosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.combosService.findOne(id);
  }

  @Put(':id') // <- reemplazado PATCH por PUT
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateComboAdminDto,
  ) {
    return this.combosService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.combosService.remove(id);
  }

  // =========================
  // Combo Products
  // =========================

  @Post('product')
  addProductToCombo(@Body() dto: CreateProductToComboAdminDto) {
    return this.combosService.addProductToCombo(dto);
  }

  @Put('product/:id') // <- reemplazado PATCH por PUT
  updateComboProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateComboProductAdminDto,
  ) {
    return this.combosService.updateComboProduct(id, dto);
  }

  @Delete('product/:id')
  removeComboProduct(@Param('id', ParseIntPipe) id: number) {
    return this.combosService.removeComboProduct(id);
  }

  @Get(':id/products')
  getProductsByCombo(@Param('id', ParseIntPipe) id: number) {
    return this.combosService.getProductsByCombo(id);
  }
}
