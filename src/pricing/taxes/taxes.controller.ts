import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { TaxService } from './taxes.service';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';

@Controller('pricing/taxes')
export class TaxController {
  constructor(private readonly taxService: TaxService) {}

  @Post()
  create(@Body() dto: CreateTaxDto) {
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
  update(@Param('id') id: number, @Body() dto: UpdateTaxDto) {
    return this.taxService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.taxService.remove(+id);
  }
}
