import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersClientModule } from './client/user.client.module';
import { UsersAdminModule } from './admin/users.admin.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    UsersClientModule,
    UsersAdminModule,
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
