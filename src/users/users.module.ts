import { Module } from '@nestjs/common';
import { UsersClientModule } from './client/user.client.module';

@Module({
  imports: [
    UsersClientModule,
  ],
})
export class UsersModule {}

