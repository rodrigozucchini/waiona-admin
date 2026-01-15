import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { MarginService } from './margins.service';
import { CreateMarginDto } from './dto/create-margin.dto';
import { UpdateMarginDto } from './dto/update-margin.dto';

@Controller('pricing/margins')
export class MarginController {
  constructor(private readonly marginService: MarginService) {}

  @Post()
  create(@Body() dto: CreateMarginDto) {
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
  update(@Param('id') id: number, @Body() dto: UpdateMarginDto) {
    return this.marginService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.marginService.remove(+id);
  }
}
