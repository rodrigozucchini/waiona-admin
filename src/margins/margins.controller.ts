import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MarginsService } from './margins.service';
import { CreateMarginDto } from './dto/create-margin.dto';
import { UpdateMarginDto } from './dto/update-margin.dto';

@Controller('margins')
export class MarginsController {
  constructor(private readonly marginsService: MarginsService) {}

  @Post()
  create(@Body() createMarginDto: CreateMarginDto) {
    return this.marginsService.create(createMarginDto);
  }

  @Get()
  findAll() {
    return this.marginsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.marginsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMarginDto: UpdateMarginDto) {
    return this.marginsService.update(+id, updateMarginDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.marginsService.remove(+id);
  }
}
