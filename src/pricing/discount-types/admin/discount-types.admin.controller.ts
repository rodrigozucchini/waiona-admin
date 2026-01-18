import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DiscountTypeAdminService } from './discount-types.admin.service';
import { CreateDiscountTypeAdminDto } from './dto/create-discount-type.admin.dto';
import { UpdateDiscountTypeAdminDto } from './dto/update-discount-type.admin.dto';

@Controller('pricing/discount-types')
export class DiscountTypeAdminController {
  constructor(private readonly discountTypesService: DiscountTypeAdminService) {}

  @Post()
  create(@Body() dto: CreateDiscountTypeAdminDto) {
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
  update(@Param('id') id: number, @Body() dto: UpdateDiscountTypeAdminDto) {
    return this.discountTypesService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.discountTypesService.remove(+id);
  }
}
