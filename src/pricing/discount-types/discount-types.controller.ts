import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DiscountTypesService } from './discount-types.service';
import { CreateDiscountTypeDto } from './dto/create-discount-type.dto';
import { UpdateDiscountTypeDto } from './dto/update-discount-type.dto';

@Controller('pricing/discount-types')
export class DiscountTypesController {
  constructor(private readonly discountTypesService: DiscountTypesService) {}

  @Post()
  create(@Body() dto: CreateDiscountTypeDto) {
    return this.discountTypesService.create(dto);
  }

  @Get()
  findAll() {
    return this.discountTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.discountTypesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateDiscountTypeDto) {
    return this.discountTypesService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.discountTypesService.remove(+id);
  }
}
