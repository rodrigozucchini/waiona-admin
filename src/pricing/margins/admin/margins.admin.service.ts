import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarginEntity } from './entities/margin.entity';
import { CreateMarginAdminDto } from './dto/create-margin.admin.dto';
import { UpdateMarginAdminDto } from './dto/update-margin.admin.dto';

@Injectable()
export class MarginAdminService {
  constructor(
    @InjectRepository(MarginEntity)
    private readonly marginRepository: Repository<MarginEntity>,
  ) {}

  async create(dto: CreateMarginAdminDto) {
    const margin = this.marginRepository.create(dto);
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

    if (!margin) throw new NotFoundException('Margin not found');

    return margin;
  }

  async update(id: number, dto: UpdateMarginAdminDto) {
    const margin = await this.findOne(id);
    Object.assign(margin, dto);
    return this.marginRepository.save(margin);
  }

  async remove(id: number) {
    const margin = await this.findOne(id);
    margin.isDeleted = true;
    return this.marginRepository.save(margin);
  }
}
