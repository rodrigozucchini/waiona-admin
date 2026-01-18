import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ComboEntity } from './entities/combo.entity';
import { ComboProductEntity } from './entities/combo-product.entity';

import { CreateComboAdminDto } from './dto/create-combo.admin.dto';
import { UpdateComboAdminDto } from './dto/update-combo.admin.dto';

import { UpdateComboProductAdminDto } from './dto/update-combo-product.admin.dto';
import { AddProductToComboAdminDto } from './dto/add-product-combo.admin.dto';

@Injectable()
export class ComboAdminService {
  constructor(
    @InjectRepository(ComboEntity)
    private readonly comboRepository: Repository<ComboEntity>,

    @InjectRepository(ComboProductEntity)
    private readonly comboProductRepository: Repository<ComboProductEntity>,
  ) {}

  // =========================
  // Combos CRUD
  // =========================

  async create(dto: CreateComboAdminDto) {
    const combo = this.comboRepository.create(dto);
    return this.comboRepository.save(combo);
  }

  findAll() {
    return this.comboRepository.find({
      where: { isDeleted: false },
    });
  }

  async findOne(id: number) {
    const combo = await this.comboRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['products', 'products.product'],
    });

    if (!combo) {
      throw new NotFoundException('Combo not found');
    }

    return combo;
  }

  async update(id: number, dto: UpdateComboAdminDto) {
    const combo = await this.findOne(id);
    Object.assign(combo, dto);
    return this.comboRepository.save(combo);
  }

  async remove(id: number) {
    const combo = await this.findOne(id);
    combo.isDeleted = true;
    return this.comboRepository.save(combo);
  }

  // =========================
  // Combo Products
  // =========================

  async addProductToCombo(dto: AddProductToComboAdminDto) {
    const relation = this.comboProductRepository.create(dto);
    return this.comboProductRepository.save(relation);
  }

  async updateComboProduct(id: number, dto: UpdateComboProductAdminDto) {
    const relation = await this.comboProductRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!relation) {
      throw new NotFoundException('Combo product not found');
    }

    Object.assign(relation, dto);
    return this.comboProductRepository.save(relation);
  }

  async removeComboProduct(id: number) {
    const relation = await this.comboProductRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!relation) {
      throw new NotFoundException('Combo product not found');
    }

    relation.isDeleted = true;
    return this.comboProductRepository.save(relation);
  }

  async getProductsByCombo(comboId: number) {
    return this.comboProductRepository.find({
      where: {
        comboId,
        isDeleted: false,
      },
      relations: ['product'],
    });
  }
}
