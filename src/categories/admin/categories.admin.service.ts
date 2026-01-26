import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEntity } from '../entities/category.entity';
import { CreateCategoryAdminDto } from './dto/create-category.admin.dto';
import { UpdateCategoryAdminDto } from './dto/update-category.admin.dto';

@Injectable()
export class CategoriesAdminService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async create(dto: CreateCategoryAdminDto) {
    const category = this.categoryRepository.create({
      name: dto.name,
    });

    if (dto.parentId) {
      const parent = await this.categoryRepository.findOne({
        where: { id: dto.parentId, isDeleted: false },
      });

      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }

      category.parent = parent;
    }

    return this.categoryRepository.save(category);
  }

  findAll() {
    return this.categoryRepository.find({
      where: { isDeleted: false },
      relations: ['parent'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number) {
    const category = await this.categoryRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['parent'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: number, dto: UpdateCategoryAdminDto) {
    const category = await this.findOne(id);
  
    // 🔹 actualizar nombre
    if (dto.name !== undefined) {
      category.name = dto.name;
    }
  
    // 🔹 actualizar padre (clave del problema)
    if (dto.parentId !== undefined) {
      // categoría raíz
      if (dto.parentId === null) {
        category.parent = null;
      } else {
        // no puede ser su propio padre
        if (dto.parentId === id) {
          throw new BadRequestException('Category cannot be its own parent');
        }
  
        const parent = await this.categoryRepository.findOne({
          where: { id: dto.parentId, isDeleted: false },
        });
  
        if (!parent) {
          throw new NotFoundException('Parent category not found');
        }
  
        category.parent = parent;
      }
    }
  
    return this.categoryRepository.save(category);
  }
  

  async remove(id: number) {
    const category = await this.findOne(id);
    category.isDeleted = true;
    return this.categoryRepository.save(category);
  }
}
