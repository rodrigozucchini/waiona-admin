import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { ProductEntity } from '../entities/product.entity';
import { CreateProductAdminDto } from './dto/create-product.admin.dto';
import { UpdateProductAdminDto } from './dto/update-product.admin.dto';
import { MarginEntity } from '../../pricing/margins/entities/margin.entity';
import { TaxEntity } from '../../pricing/taxes/admin/entities/tax.entity';

@Injectable()
export class ProductsAdminService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,

    @InjectRepository(MarginEntity)
    private readonly marginRepository: Repository<MarginEntity>,

    @InjectRepository(TaxEntity)
    private readonly taxRepository: Repository<TaxEntity>,
  ) {}

  /* =======================
      CREATE
  ======================= */
  async create(dto: CreateProductAdminDto) {
    const product = this.productRepository.create({
      sku: dto.sku,
      name: dto.name,
      description: dto.description,
      type: dto.type,
      basePrice: dto.basePrice,
      margin: dto.marginId
        ? await this.resolveMargin(dto.marginId)
        : null,
      taxes: dto.taxIds?.length
        ? await this.resolveTaxes(dto.taxIds)
        : [],
    });

    return this.productRepository.save(product);
  }

  /* =======================
      FIND
  ======================= */
  findAll() {
    return this.productRepository.find({
      where: { isDeleted: false },
      relations: [
        'images',
        'images.image',
        'margin',
        'taxes',
        'taxes.taxType',
      ],
    });
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: { id, isDeleted: false },
      relations: [
        'images',
        'images.image',
        'margin',
        'taxes',
        'taxes.taxType',
      ],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  /* =======================
      UPDATE
  ======================= */
  async update(id: number, dto: UpdateProductAdminDto) {
    const product = await this.findOne(id);

    Object.assign(product, {
      sku: dto.sku ?? product.sku,
      name: dto.name ?? product.name,
      description: dto.description ?? product.description,
      type: dto.type ?? product.type,
      basePrice: dto.basePrice ?? product.basePrice,
    });

    if (dto.marginId !== undefined) {
      product.margin = dto.marginId
        ? await this.resolveMargin(dto.marginId)
        : null;
    }

    if (dto.taxIds !== undefined) {
      product.taxes = dto.taxIds.length
        ? await this.resolveTaxes(dto.taxIds)
        : [];
    }

    return this.productRepository.save(product);
  }

  /* =======================
      DELETE (SOFT)
  ======================= */
  async remove(id: number) {
    const product = await this.findOne(id);
    product.isDeleted = true;
    return this.productRepository.save(product);
  }

  /* =======================
      HELPERS
  ======================= */
  private async resolveMargin(marginId: number): Promise<MarginEntity> {
    const margin = await this.marginRepository.findOneBy({
      id: marginId,
      isDeleted: false,
    });

    if (!margin) {
      throw new NotFoundException(`Margin ${marginId} not found`);
    }

    return margin;
  }

  private async resolveTaxes(taxIds: number[]): Promise<TaxEntity[]> {
    const taxes = await this.taxRepository.find({
      where: { id: In(taxIds), isDeleted: false },
    });

    if (taxes.length !== taxIds.length) {
      throw new NotFoundException('One or more taxes not found');
    }

    return taxes;
  }
}
