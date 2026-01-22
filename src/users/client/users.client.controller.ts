import { Controller, Post, Body, Get, Put, Param } from '@nestjs/common';
import { UsersClientService } from './users.client.service';

import { UserResponseClientDto } from './dto/user-response-client.dto';
import { CreateUserClientDto } from './dto/create-user-client.dto';
import { ChangePasswordClientDto } from './dto/change-password-client.dto';
import { UpdateUserClientDto } from './dto/update-user-client.dto';

@Controller('users')
export class UsersClientController {
  constructor(private readonly userClientService: UsersClientService) {}

  // Registro
  @Post()
  async register(@Body() dto: CreateUserClientDto): Promise<UserResponseClientDto> {
    return this.userClientService.create(dto);
  }

  // Obtener perfil (temporal: con param userId hasta que tengamos auth)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserResponseClientDto> {
    return this.userClientService.findMe(Number(id));
  }

  // Actualizar perfil
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserClientDto): Promise<UserResponseClientDto> {
    return this.userClientService.update(Number(id), dto);
  }

  // Cambiar contraseña
  @Put(':id/password')
  async changePassword(@Param('id') id: string, @Body() dto: ChangePasswordClientDto): Promise<void> {
    return this.userClientService.changePassword(Number(id), dto);
  }
}
