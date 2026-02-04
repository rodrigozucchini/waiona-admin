import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import { DiscountsAdminService } from './discounts.admin.service';
import { CreateDiscountAdminDto } from './dto/create-discount.admin.dto';
import { UpdateDiscountAdminDto } from './dto/update-discount.admin.dto';

@Controller('admin/pricing/discounts')
export class DiscountsAdminController {
  constructor(private readonly discountsService: DiscountsAdminService) {}

  @Post()
  create(@Body() dto: CreateDiscountAdminDto) {
    return this.discountsService.create(dto);
  }

  @Get()
  findAll() {
    return this.discountsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.discountsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDiscountAdminDto,
  ) {
    return this.discountsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.discountsService.remove(id);
  }
}
