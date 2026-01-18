import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    Delete,
  } from '@nestjs/common';
  
  import { ComboAdminService } from './combos.admin.service';
  import { CreateComboAdminDto } from './dto/create-combo.admin.dto';
  import { UpdateComboAdminDto } from './dto/update-combo.admin.dto';
  import { UpdateComboProductAdminDto } from './dto/update-combo-product.admin.dto';
  import { AddProductToComboAdminDto } from './dto/add-product-combo.admin.dto';
  
  @Controller('admin/combos')
  export class ComboAdminController {
    constructor(private readonly combosService: ComboAdminService) {}
  
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
    findOne(@Param('id') id: number) {
      return this.combosService.findOne(+id);
    }
  
    @Patch(':id')
    update(@Param('id') id: number, @Body() dto: UpdateComboAdminDto) {
      return this.combosService.update(+id, dto);
    }
  
    @Delete(':id')
    remove(@Param('id') id: number) {
      return this.combosService.remove(+id);
    }
  
    // =========================
    // Combo Products
    // =========================
  
    @Post('product')
    addProductToCombo(@Body() dto: AddProductToComboAdminDto) {
      return this.combosService.addProductToCombo(dto);
    }
  
    @Patch('product/:id')
    updateComboProduct(
      @Param('id') id: number,
      @Body() dto: UpdateComboProductAdminDto,
    ) {
      return this.combosService.updateComboProduct(+id, dto);
    }
  
    @Delete('product/:id')
    removeComboProduct(@Param('id') id: number) {
      return this.combosService.removeComboProduct(+id);
    }
  
    @Get(':id/products')
    getProductsByCombo(@Param('id') id: number) {
      return this.combosService.getProductsByCombo(+id);
    }
  }
  