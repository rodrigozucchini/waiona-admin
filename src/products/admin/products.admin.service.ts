import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ProductEntity } from './entities/product.entity';
import { CreateProductAdminDto } from './dto/create-product.admin.dto';
import { UpdateProductAdminDto } from './dto/update-product.admin.dto';
import { MarginEntity } from 'src/pricing/margins/admin/entities/margin.entity';
import { TaxEntity } from 'src/pricing/taxes/admin/entities/tax.entity';

@Injectable()
export class ProductAdminService {
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

    if (!product) throw new NotFoundException('Product not found');

    return product;
  }

  async update(id: number, dto: UpdateProductAdminDto) {
    const product = await this.findOne(id);

    Object.assign(product, dto);

    if (dto.marginId !== undefined) {
      product.margin = dto.marginId
        ? await this.marginRepository.findOneBy({
            id: dto.marginId,
            isDeleted: false,
          })
        : null;
    }

    if (dto.taxIds) {
      product.taxes = await this.taxRepository.find({
        where: { id: In(dto.taxIds), isDeleted: false },
      });
    }

    return this.productRepository.save(product);
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    product.isDeleted = true;
    return this.productRepository.save(product);
  }
}
