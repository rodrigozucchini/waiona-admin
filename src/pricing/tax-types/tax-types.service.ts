import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaxTypeEntity } from './entities/tax-type.entity';
import { CreateTaxTypeDto } from './dto/create-tax-type.dto';
import { UpdateTaxTypeDto } from './dto/update-tax-type.dto';

@Injectable()
export class TaxTypeService {
  constructor(
    @InjectRepository(TaxTypeEntity)
    private readonly taxTypeRepository: Repository<TaxTypeEntity>,
  ) {}

  async create(dto: CreateTaxTypeDto) {
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

  async update(id: number, dto: UpdateTaxTypeDto) {
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
