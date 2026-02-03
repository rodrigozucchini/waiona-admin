import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { DiscountTypesAdminService } from './discount-types.admin.service';
import { CreateDiscountTypeAdminDto } from './dto/create-discount-type.admin.dto';
import { UpdateDiscountTypeAdminDto } from './dto/update-discount-type.admin.dto';

@Controller('admin/pricing/discount-types')
export class DiscountTypesAdminController {
  constructor(
    private readonly discountTypesService: DiscountTypesAdminService,
  ) {}

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

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateDiscountTypeAdminDto) {
    return this.discountTypesService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.discountTypesService.remove(+id);
  }
}
