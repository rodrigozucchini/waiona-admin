import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { AuthService } from '../service/auth.service';
import { UserEntity } from '../../users/entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly authService: AuthService) {
    // Le decimos a passport-local que el "username" es el campo email
    super({ usernameField: 'email' , passwordField: 'password'});
  }

  /**
   * Passport llama a este método pasando (email, password).
   * Delegamos en AuthService la lógica de validación.
   */
  async validate(email: string, password: string) {
    const user = this.authService.validateUser(email, password);
    return user;
  }
}

