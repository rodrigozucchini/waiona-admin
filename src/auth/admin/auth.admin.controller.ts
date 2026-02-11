import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { UserEntity } from 'src/users/entities/user.entity';
import { AuthService } from '../service/auth.service';

@Controller('admin/auth')
export class AuthAdminController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Req() req: Request) {
    const user = req.user as UserEntity;
    return {
      user,
      access_tokern: this.authService.generateToken(user),
    }
  }
}
