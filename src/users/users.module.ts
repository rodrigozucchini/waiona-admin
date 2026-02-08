import { Module } from '@nestjs/common';
import { UsersClientModule } from './client/user.client.module';
import { UsersAdminModule } from './admin/users.admin.module';

@Module({
  imports: [
    UsersClientModule,
    UsersAdminModule,
  ],
})
export class UsersModule {}
