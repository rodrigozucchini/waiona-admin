import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiscountTypeEntity } from './entities/discount-type.entity';
import { CreateDiscountTypeAdminDto } from './dto/create-discount-type.admin.dto';
import { UpdateDiscountTypeAdminDto } from './dto/update-discount-type.admin.dto';

@Injectable()
export class DiscountTypeAdminService {
  constructor(
    @InjectRepository(DiscountTypeEntity)
    private readonly discountTypeRepository: Repository<DiscountTypeEntity>,
  ) {}

  async create(dto: CreateDiscountTypeAdminDto) {
    const discountType = this.discountTypeRepository.create(dto);
    return this.discountTypeRepository.save(discountType);
  }

  async findAll() {
    return this.discountTypeRepository.find({
      where: { isDeleted: false },
    });
  }

  async findOne(id: number) {
    const discountType = await this.discountTypeRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!discountType) {
      throw new NotFoundException('Discount type not found');
    }

    return discountType;
  }

  async update(id: number, dto: UpdateDiscountTypeAdminDto) {
    const discountType = await this.findOne(id);
    Object.assign(discountType, dto);
    return this.discountTypeRepository.save(discountType);
  }

  async remove(id: number) {
    const discountType = await this.findOne(id);
    discountType.isDeleted = true;
    return this.discountTypeRepository.save(discountType);
  }
}

