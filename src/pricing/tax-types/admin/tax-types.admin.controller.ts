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
import { TaxTypesAdminService } from './tax-types.admin.service';
import { CreateTaxTypeAdminDto } from './dto/create-tax-type.admin.dto';
import { UpdateTaxTypeAdminDto } from './dto/update-tax-type.admin.dto';

@Controller('admin/pricing/tax-types')
export class TaxTypesAdminController {
  constructor(private readonly taxTypeService: TaxTypesAdminService) {}

  @Post()
  create(@Body() dto: CreateTaxTypeAdminDto) {
    return this.taxTypeService.create(dto);
  }

  @Get()
  findAll() {
    return this.taxTypeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.taxTypeService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTaxTypeAdminDto,
  ) {
    return this.taxTypeService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.taxTypeService.remove(id);
  }
}
