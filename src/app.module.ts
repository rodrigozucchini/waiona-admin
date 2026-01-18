import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ProductsModule } from './products/admin/products.admin.module';
import { TaxesModule } from './pricing/taxes/admin/taxes.admin.module';
import { MarginsModule } from './pricing/margins/admin/margins.admin.module';
import { DiscountsModule } from './pricing/discounts/admin/discounts.admin.module';
import { TaxTypesModule } from './pricing/tax-types/admin/tax-types.admin.module';
import { DiscountTypesModule } from './pricing/discount-types/admin/discount-types.admin.module';
import { UsersModule } from './users/users.module';
import { PermissionsModule } from './permissions/permissions.module';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';
import { ProfilesModule } from './profiles/profiles.module';

@Module({
  imports: [
    // 🔥 ACA SE CREA EL DATASOURCE
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',        // Nest corre en tu PC
      port: 5432,
      username: 'waiona_user',
      password: 'waiona_password',
      database: 'waiona_db',
      autoLoadEntities: true,
      synchronize: true,       // solo dev
    }),

    ProductsModule,
    TaxesModule,
    MarginsModule,
    DiscountsModule,
    TaxTypesModule,
    DiscountTypesModule,
    UsersModule,
    PermissionsModule,
    RolesModule,
    AuthModule,
    ProfilesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
