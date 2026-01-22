import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

import { UserEntity } from 'src/users/entities/user.entity';

import { UserResponseClientDto } from './dto/user-response-client.dto';
import { CreateUserClientDto } from './dto/create-user-client.dto';
import { UpdateUserClientDto } from './dto/update-user-client.dto';
import { ChangePasswordClientDto } from './dto/change-password-client.dto';

@Injectable()
export class UsersClientService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  // ================= Registro de usuario =================
  async create(createUserDto: CreateUserClientDto): Promise<UserResponseClientDto> {
    // Verificar email duplicado
    const existingUser = await this.userRepository.findOne({
      where: { person: { email: createUserDto.email } },
      relations: ['person'],
    });

    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    // Crear entidad user + persona
    const user = this.userRepository.create({
      password: createUserDto.password, // se hash automáticamente en @BeforeInsert()
      person: { ...createUserDto },
    });

    await this.userRepository.save(user);

    return this.toResponseDto(user);
  }

  // ================= Obtener perfil =================
  async findMe(userId: number): Promise<UserResponseClientDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['person'],
    });

    if (!user) throw new NotFoundException('User not found');

    return this.toResponseDto(user);
  }

  // ================= Actualizar perfil =================
  async update(userId: number, updateUserDto: UpdateUserClientDto): Promise<UserResponseClientDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['person'],
    });

    if (!user) throw new NotFoundException('User not found');

    // Actualizar solo los campos de persona
    if (user.person) {
      Object.assign(user.person, updateUserDto);
    }

    // Si viene nueva contraseña, hay que hashearla manualmente
    if (updateUserDto.password) {
      user.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    await this.userRepository.save(user);

    return this.toResponseDto(user);
  }

  // ================= Cambiar contraseña =================
  async changePassword(userId: number, dto: ChangePasswordClientDto): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['person'],
    });

    if (!user) throw new NotFoundException('User not found');

    // Verificar password actual
    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isMatch) throw new BadRequestException('Current password is incorrect');

    // Hashear nueva contraseña
    user.password = await bcrypt.hash(dto.newPassword, 10);

    await this.userRepository.save(user);
  }

  // ================= Transformar a DTO =================
  private toResponseDto(user: UserEntity): UserResponseClientDto {
    const person = user.person;

    return {
      id: user.id,
      firstName: person?.firstName,
      lastName: person?.lastName,
      email: person?.email,
      phoneNumber: person?.phoneNumber,
      address: person?.address,
      type: person?.type,
      documentType: person?.documentType,
      documentNumber: person?.documentNumber,
      lastLoginAt: user.lastLoginAt,
      emailVerified: user.emailVerified,
    };
  }
}
