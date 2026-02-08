import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { TaxesAdminService } from './taxes.admin.service';
import { CreateTaxAdminDto } from './dto/create-tax.admin.dto';
import { UpdateTaxAdminDto } from './dto/update-tax.admin.dto';

@Controller('/admin/pricing/taxes')
export class TaxesAdminController {
  constructor(private readonly taxService: TaxesAdminService) {}

  @Post()
  create(@Body() dto: CreateTaxAdminDto) {
    return this.taxService.create(dto);
  }

  @Get()
  findAll() {
    return this.taxService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.taxService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTaxAdminDto,
  ) {
    return this.taxService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.taxService.remove(id);
  }
}
