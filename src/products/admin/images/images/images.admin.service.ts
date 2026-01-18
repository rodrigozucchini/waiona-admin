import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImageEntity } from '../entities/image.entity';
import { ProductImageEntity } from '../entities/product-image.entity';
import { ComboImageEntity } from '../entities/combo-image.entity';
import { CreateImageAdminDto } from '../dto/create-image.admin.dto';
import { UpdateImageAdminDto } from '../dto/update-imageadmin..dto';
import { CreateProductImageAdminDto } from '../dto/create-product-image.admin.dto';
import { CreateComboImageAdminDto } from '../dto/create-combo-image.admin.dto';



@Injectable()
export class ImageAdminService {
  constructor(
    @InjectRepository(ImageEntity)
    private readonly imageRepository: Repository<ImageEntity>,

    @InjectRepository(ProductImageEntity)
    private readonly productImageRepository: Repository<ProductImageEntity>,

    @InjectRepository(ComboImageEntity)
    private readonly comboImageRepository: Repository<ComboImageEntity>,
  ) {}

  // =========================
  // Images CRUD
  // =========================

  async create(dto: CreateImageAdminDto) {
    const image = this.imageRepository.create(dto);
    return this.imageRepository.save(image);
  }

  findAll() {
    return this.imageRepository.find({
      where: { isDeleted: false },
    });
  }

  async findOne(id: number) {
    const image = await this.imageRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    return image;
  }

  async update(id: number, dto: UpdateImageAdminDto) {
    const image = await this.findOne(id);
    Object.assign(image, dto);
    return this.imageRepository.save(image);
  }

  async remove(id: number) {
    const image = await this.findOne(id);
    image.isDeleted = true;
    return this.imageRepository.save(image);
  }

  // =========================
  // Product Images
  // =========================

  async addImageToProduct(dto: CreateProductImageAdminDto) {
    const relation = this.productImageRepository.create(dto);
    return this.productImageRepository.save(relation);
  }

  async getImagesByProduct(productId: number) {
    return this.productImageRepository.find({
      where: {
        productId,
        isDeleted: false,
      },
      relations: ['image'],
    });
  }

  // =========================
  // Combo Images
  // =========================

  async addImageToCombo(dto: CreateComboImageAdminDto) {
    const relation = this.comboImageRepository.create(dto);
    return this.comboImageRepository.save(relation);
  }

  async getImagesByCombo(comboId: number) {
    return this.comboImageRepository.find({
      where: {
        comboId,
        isDeleted: false,
      },
      relations: ['image'],
    });
  }
}
