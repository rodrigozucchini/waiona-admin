import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { AuthService } from '../service/auth.service';
import { UserEntity } from 'src/users/entities/user.entity';

@Controller('client/auth')
export class AuthClientController {
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
