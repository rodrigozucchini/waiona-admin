import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { UserEntity } from '../entities/user.entity';
import { RoleEntity } from '../../roles/entities/role.entity';

import { CreateUserAdminDto } from './dto/create-admin-user.dto';
import { UpdateUserAdminDto } from './dto/update-admin-user.dto';
import { ChangeUserStatusAdminDto } from './dto/change-user-status.dto';
import { ResetPasswordAdminDto } from './dto/reset-password.dto';

@Injectable()
export class UsersAdminService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
  ) {}

  async create(dto: CreateUserAdminDto) {
    const existingUser = await this.userRepository.findOne({
      where: { person: { email: dto.email } },
      relations: ['person'],
    });

    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const role = await this.roleRepository.findOne({
      where: { id: dto.roleId, isDeleted: false },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const user = this.userRepository.create({
      password: dto.password,
      role,
      person: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phoneNumber: dto.phoneNumber,
        address: dto.address,
        type: dto.type,
        documentType: dto.documentType,
        documentNumber: dto.documentNumber,
      },
    });

    return this.userRepository.save(user);
  }

  findAll() {
    return this.userRepository.find({
      where: { isDeleted: false },
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: number, dto: UpdateUserAdminDto) {
    const user = await this.findOne(id);

    if (dto.firstName !== undefined) {
      user.person.firstName = dto.firstName;
    }

    if (dto.lastName !== undefined) {
      user.person.lastName = dto.lastName;
    }

    if (dto.phoneNumber !== undefined) {
      user.person.phoneNumber = dto.phoneNumber;
    }

    if (dto.address !== undefined) {
      user.person.address = dto.address;
    }

    if (dto.password) {
      user.password = await bcrypt.hash(dto.password, 10);
    }

    if (dto.status !== undefined) {
      user.status = dto.status;
    }

    if (dto.roleId !== undefined) {
      const role = await this.roleRepository.findOne({
        where: { id: dto.roleId, isDeleted: false },
      });

      if (!role) {
        throw new NotFoundException('Role not found');
      }

      user.role = role;
    }

    return this.userRepository.save(user);
  }

  async changeStatus(id: number, dto: ChangeUserStatusAdminDto) {
    const user = await this.findOne(id);
    user.status = dto.status;
    return this.userRepository.save(user);
  }

  async resetPassword(id: number, dto: ResetPasswordAdminDto) {
    const user = await this.findOne(id);
    user.password = await bcrypt.hash(dto.newPassword, 10);
    return this.userRepository.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    user.isDeleted = true;
    return this.userRepository.save(user);
  }
}
