import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { TaxTypeService } from './tax-types.service';
import { CreateTaxTypeDto } from './dto/create-tax-type.dto';
import { UpdateTaxTypeDto } from './dto/update-tax-type.dto';

@Controller('pricing/tax-types')
export class TaxTypeController {
  constructor(private readonly taxTypeService: TaxTypeService) {}

  @Post()
  create(@Body() dto: CreateTaxTypeDto) {
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
  update(@Param('id') id: number, @Body() dto: UpdateTaxTypeDto) {
    return this.taxTypeService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.taxTypeService.remove(+id);
  }
}
