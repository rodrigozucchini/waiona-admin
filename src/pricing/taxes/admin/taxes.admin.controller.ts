import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { TaxAdminService } from './taxes.admin.service';
import { CreateTaxAdminDto } from './dto/create-tax.admin.dto';
import { UpdateTaxAdminDto } from './dto/update-tax.admin.dto';

@Controller('/admin/pricing/taxes')
export class TaxAdminController {
  constructor(private readonly taxService: TaxAdminService) {}

  @Post()
  create(@Body() dto: CreateTaxAdminDto) {
    return this.taxService.create(dto);
  }

  @Get()
  findAll() {
    return this.taxService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.taxService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateTaxAdminDto) {
    return this.taxService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.taxService.remove(+id);
  }
}
