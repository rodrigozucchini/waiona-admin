import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { UsersModule } from '../users/users.module';
import { AuthService } from './service/auth.service';
import { LocalStrategy } from './strategies/local.strategies';
import { AuthAdminController } from './admin/auth.admin.controller';
import { AuthClientController } from './client/auth.client.controller';

@Module({
  imports: [UsersModule, PassportModule],
  controllers: [AuthAdminController, AuthClientController],
  providers: [AuthService, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}
