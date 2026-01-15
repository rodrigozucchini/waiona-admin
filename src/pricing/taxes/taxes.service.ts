import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaxEntity } from './entities/tax.entity';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';

@Injectable()
export class TaxService {
  constructor(
    @InjectRepository(TaxEntity)
    private readonly taxRepository: Repository<TaxEntity>,
  ) {}

  async create(dto: CreateTaxDto) {
    const tax = this.taxRepository.create(dto);
    return this.taxRepository.save(tax);
  }

  findAll() {
    return this.taxRepository.find({
      relations: ['taxType'],
      where: { isDeleted: false },
    });
  }

  async findOne(id: number) {
    const tax = await this.taxRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['taxType'],
    });

    if (!tax) throw new NotFoundException('Tax not found');

    return tax;
  }

  async update(id: number, dto: UpdateTaxDto) {
    const tax = await this.findOne(id);
    Object.assign(tax, dto);
    return this.taxRepository.save(tax);
  }

  async remove(id: number) {
    const tax = await this.findOne(id);
    tax.isDeleted = true;
    return this.taxRepository.save(tax);
  }
}
