import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiscountEntity } from './entities/discount.entity';
import { DiscountTypeEntity } from '../../discount-types/admin/entities/discount-type.entity';
import { CreateDiscountAdminDto } from './dto/create-discount.admin.dto';
import { UpdateDiscountAdminDto } from './dto/update-discount.admin.dto';

@Injectable()
export class DiscountAdminService {
  constructor(
    @InjectRepository(DiscountEntity)
    private readonly discountRepository: Repository<DiscountEntity>,

    @InjectRepository(DiscountTypeEntity)
    private readonly discountTypeRepository: Repository<DiscountTypeEntity>,
  ) {}

  async create(dto: CreateDiscountAdminDto) {
    const discountType = await this.discountTypeRepository.findOne({
      where: { id: dto.discountTypeId, isDeleted: false },
    });

    if (!discountType) {
      throw new NotFoundException('Discount type not found');
    }

    const discount = this.discountRepository.create({
      value: dto.value,
      isPercentage: dto.isPercentage,
      discountType,
    });

    return this.discountRepository.save(discount);
  }

  async findAll() {
    return this.discountRepository.find({
      where: { isDeleted: false },
      relations: ['discountType'],
    });
  }

  async findOne(id: number) {
    const discount = await this.discountRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['discountType'],
    });

    if (!discount) {
      throw new NotFoundException('Discount not found');
    }

    return discount;
  }

  async update(id: number, dto: UpdateDiscountAdminDto) {
    const discount = await this.findOne(id);

    if (dto.discountTypeId) {
      const discountType = await this.discountTypeRepository.findOne({
        where: { id: dto.discountTypeId, isDeleted: false },
      });

      if (!discountType) {
        throw new NotFoundException('Discount type not found');
      }

      discount.discountType = discountType;
    }

    if (dto.value !== undefined) discount.value = dto.value;
    if (dto.isPercentage !== undefined) discount.isPercentage = dto.isPercentage;

    return this.discountRepository.save(discount);
  }

  async remove(id: number) {
    const discount = await this.findOne(id);
    discount.isDeleted = true;
    return this.discountRepository.save(discount);
  }
}
