import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DiscountAdminService } from './discounts.admin.service';
import { CreateDiscountAdminDto } from './dto/create-discount.admin.dto';
import { UpdateDiscountAdminDto } from './dto/update-discount.admin.dto';

@Controller('admin/pricing/discounts')
export class DiscountAdminController {
  constructor(private readonly discountsService: DiscountAdminService) {}

  @Post()
  create(@Body() dto: CreateDiscountAdminDto) {
    return this.discountsService.create(dto);
  }

  @Get()
  findAll() {
    return this.discountsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.discountsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateDiscountAdminDto) {
    return this.discountsService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.discountsService.remove(+id);
  }
}
