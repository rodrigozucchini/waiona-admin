import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaxEntity } from './entities/tax.entity';
import { CreateTaxAdminDto } from './dto/create-tax.admin.dto';
import { UpdateTaxAdminDto } from './dto/update-tax.admin.dto';

@Injectable()
export class TaxAdminService {
  constructor(
    @InjectRepository(TaxEntity)
    private readonly taxRepository: Repository<TaxEntity>,
  ) {}

  async create(dto: CreateTaxAdminDto) {
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

  async update(id: number, dto: UpdateTaxAdminDto) {
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
