import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { TaxTypeAdminService } from './tax-types.admin.service';
import { CreateTaxTypeAdminDto } from './dto/create-tax-type.admin.dto';
import { UpdateTaxTypeAdminDto } from './dto/update-tax-type.admin.dto';

@Controller('admin/pricing/tax-types')
export class TaxTypeAdminController {
  constructor(private readonly taxTypeService: TaxTypeAdminService) {}

  @Post()
  create(@Body() dto: CreateTaxTypeAdminDto) {
    return this.taxTypeService.create(dto);
  }

  @Get()
  findAll() {
    return this.taxTypeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.taxTypeService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateTaxTypeAdminDto) {
    return this.taxTypeService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.taxTypeService.remove(+id);
  }
}
