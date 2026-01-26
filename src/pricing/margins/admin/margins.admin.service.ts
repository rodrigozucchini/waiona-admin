import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarginEntity } from '../entities/margin.entity';
import { CreateMarginAdminDto } from './dto/create-margin.admin.dto';
import { UpdateMarginAdminDto } from './dto/update-margin.admin.dto';

@Injectable()
export class MarginsAdminService {
  constructor(
    @InjectRepository(MarginEntity)
    private readonly marginRepository: Repository<MarginEntity>,
  ) {}

  async create(dto: CreateMarginAdminDto) {
    // defensa extra (por si entra algo fuera del DTO)
    if (dto.isPercentage && dto.value > 100) {
      throw new BadRequestException(
        'Percentage margin cannot exceed 100',
      );
    }

    const margin = this.marginRepository.create({
      value: dto.value,
      isPercentage: dto.isPercentage,
    });

    return this.marginRepository.save(margin);
  }

  findAll() {
    return this.marginRepository.find({
      where: { isDeleted: false },
    });
  }

  async findOne(id: number) {
    const margin = await this.marginRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!margin) {
      throw new NotFoundException('Margin not found');
    }

    return margin;
  }

  async update(id: number, dto: UpdateMarginAdminDto) {
    const margin = await this.findOne(id);

    // si actualiza el tipo
    if (dto.isPercentage !== undefined) {
      margin.isPercentage = dto.isPercentage;
    }

    // si actualiza el valor
    if (dto.value !== undefined) {
      // validación defensiva cruzada
      const isPercentage =
        dto.isPercentage !== undefined
          ? dto.isPercentage
          : margin.isPercentage;

      if (isPercentage && dto.value > 100) {
        throw new BadRequestException(
          'Percentage margin cannot exceed 100',
        );
      }

      margin.value = dto.value;
    }

    return this.marginRepository.save(margin);
  }

  async remove(id: number) {
    const margin = await this.findOne(id);
    margin.isDeleted = true;
    return this.marginRepository.save(margin);
  }
}
