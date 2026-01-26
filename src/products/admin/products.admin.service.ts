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

  async create(dto: CreateProductAdminDto) {
    const product = this.productRepository.create({
      sku: dto.sku,
      name: dto.name,
      description: dto.description,
      type: dto.type,
      basePrice: dto.basePrice,
    });

    if (dto.marginId) {
      product.margin = await this.marginRepository.findOneBy({
        id: dto.marginId,
        isDeleted: false,
      });
    }

    if (dto.taxIds?.length) {
      product.taxes = await this.taxRepository.find({
        where: { id: In(dto.taxIds), isDeleted: false },
      });
    }

    return this.productRepository.save(product);
  }

  findAll() {
    return this.productRepository.find({
      where: { isDeleted: false },
      relations: ['images', 'images.image', 'margin', 'taxes', 'taxes.taxType'],
    });
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['images', 'images.image', 'margin', 'taxes', 'taxes.taxType'],
    });

    if (!product) throw new NotFoundException('Product not found');

    return product;
  }

  async update(id: number, dto: UpdateProductAdminDto) {
    const product = await this.findOne(id);

    // Actualización de campos simples
    if (dto.sku !== undefined) product.sku = dto.sku;
    if (dto.name !== undefined) product.name = dto.name;
    if (dto.description !== undefined) product.description = dto.description;
    if (dto.type !== undefined) product.type = dto.type;
    if (dto.basePrice !== undefined) product.basePrice = dto.basePrice;

    // Actualización de margen
    if (dto.marginId !== undefined) {
      product.margin = dto.marginId
        ? await this.marginRepository.findOneBy({
            id: dto.marginId,
            isDeleted: false,
          })
        : null;
    }

    // Actualización de impuestos
    if (dto.taxIds !== undefined) {
      product.taxes = dto.taxIds.length
        ? await this.taxRepository.find({
            where: { id: In(dto.taxIds), isDeleted: false },
          })
        : [];
    }

    return this.productRepository.save(product);
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    product.isDeleted = true;
    return this.productRepository.save(product);
  }
}
