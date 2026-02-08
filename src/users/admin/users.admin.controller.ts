import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';

import { UsersAdminService } from './users.admin.service';
import { CreateUserAdminDto } from './dto/create-admin-user.dto';
import { UpdateUserAdminDto } from './dto/update-admin-user.dto';
import { ChangeUserStatusAdminDto } from './dto/change-user-status.dto';
import { ResetPasswordAdminDto } from './dto/reset-password.dto';

@Controller('admin/users')
export class UsersAdminController {
  constructor(private readonly usersAdminService: UsersAdminService) {}

  @Post()
  create(@Body() dto: CreateUserAdminDto) {
    return this.usersAdminService.create(dto);
  }

  @Get()
  findAll() {
    return this.usersAdminService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.usersAdminService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateUserAdminDto) {
    return this.usersAdminService.update(+id, dto);
  }

  @Put(':id/status')
  changeStatus(
    @Param('id') id: number,
    @Body() dto: ChangeUserStatusAdminDto,
  ) {
    return this.usersAdminService.changeStatus(+id, dto);
  }

  @Put(':id/reset-password')
  resetPassword(
    @Param('id') id: number,
    @Body() dto: ResetPasswordAdminDto,
  ) {
    return this.usersAdminService.resetPassword(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.usersAdminService.remove(+id);
  }
}
