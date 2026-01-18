import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { MarginAdminService } from './margins.admin.service';
import { CreateMarginAdminDto } from './dto/create-margin.admin.dto';
import { UpdateMarginAdminDto } from './dto/update-margin.admin.dto';

@Controller('admin/pricing/margins')
export class MarginAdminController {
  constructor(private readonly marginService: MarginAdminService) {}

  @Post()
  create(@Body() dto: CreateMarginAdminDto) {
    return this.marginService.create(dto);
  }

  @Get()
  findAll() {
    return this.marginService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.marginService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateMarginAdminDto) {
    return this.marginService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.marginService.remove(+id);
  }
}
