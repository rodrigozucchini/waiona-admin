import { Injectable } from '@nestjs/common';
import { CreateMarginDto } from './dto/create-margin.dto';
import { UpdateMarginDto } from './dto/update-margin.dto';

@Injectable()
export class MarginsService {
  create(createMarginDto: CreateMarginDto) {
    return 'This action adds a new margin';
  }

  findAll() {
    return `This action returns all margins`;
  }

  findOne(id: number) {
    return `This action returns a #${id} margin`;
  }

  update(id: number, updateMarginDto: UpdateMarginDto) {
    return `This action updates a #${id} margin`;
  }

  remove(id: number) {
    return `This action removes a #${id} margin`;
  }
}
