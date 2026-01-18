import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaxTypeEntity } from './entities/tax-type.entity';
import { CreateTaxTypeAdminDto } from './dto/create-tax-type.admin.dto';
import { UpdateTaxTypeAdminDto } from './dto/update-tax-type.admin.dto';

@Injectable()
export class TaxTypeAdminService {
  constructor(
    @InjectRepository(TaxTypeEntity)
    private readonly taxTypeRepository: Repository<TaxTypeEntity>,
  ) {}

  async create(dto: CreateTaxTypeAdminDto) {
    const taxType = this.taxTypeRepository.create(dto);
    return this.taxTypeRepository.save(taxType);
  }

  findAll() {
    return this.taxTypeRepository.find({
      where: { isDeleted: false },
    });
  }

  async findOne(id: number) {
    const taxType = await this.taxTypeRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!taxType) throw new NotFoundException('Tax type not found');

    return taxType;
  }

  async update(id: number, dto: UpdateTaxTypeAdminDto) {
    const taxType = await this.findOne(id);
    Object.assign(taxType, dto);
    return this.taxTypeRepository.save(taxType);
  }

  async remove(id: number) {
    const taxType = await this.findOne(id);
    taxType.isDeleted = true;
    return this.taxTypeRepository.save(taxType);
  }
}
