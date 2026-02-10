import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from './entities/user.entity';
import { IUserFinder } from './interfaces/user-finder.interface';

@Injectable()
export class UsersService implements IUserFinder {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  /**
   * Gets a user by email (person.email). Súper simple: recibe email y devuelve
   * el usuario o null, sin validar estado ni rol. Otras validaciones se hacen
   * en capas superiores (estrategias, guards, etc.).
   */
  async getUserByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { person: { email }, isDeleted: false },
    });
  }
}

