import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ProductsModule } from './products/products.module';
import { TaxesModule } from './pricing/taxes/admin/taxes.admin.module';
import { MarginsModule } from './pricing/margins/margins.module';
import { DiscountsModule } from './pricing/discounts/admin/discounts.admin.module';
import { TaxTypesModule } from './pricing/tax-types/admin/tax-types.admin.module';
import { DiscountTypesModule } from './pricing/discount-types/admin/discount-types.admin.module';
import { UsersModule } from './users/users.module';
import { PermissionsModule } from './permissions/permissions.module';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';
import { Env } from './env.model';
import { CombosModule } from './products/combos/combos.module';
import { CombosAdminModule } from './products/combos/admin/combos.admin.module';
import { ProductsAdminModule } from './products/admin/products.admin.module';
import { CategoriesModule } from './categories/categories.module';
import { StockAdminModule } from './stock/admin/stock.admin.module';

@Module({
  imports: [
    // 🔥 Config global
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 🔥 TypeORM
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env>) => ({
        type: 'postgres',
        host: config.get('POSTGRES_HOST', { infer: true }),
        port: config.get('POSTGRES_PORT', { infer: true }),
        username: config.get('POSTGRES_USER', { infer: true }),
        password: config.get('POSTGRES_PASSWORD', { infer: true }),
        database: config.get('POSTGRES_DB', { infer: true }),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),

    // 🔥 Admin API
    ProductsModule,
    TaxesModule,
    MarginsModule,
    DiscountsModule,
    TaxTypesModule,
    DiscountTypesModule,
    CombosModule, // 👈 entidades
    CombosAdminModule,
    ProductsAdminModule,
    // 🔥 Core system
    UsersModule,
    PermissionsModule,
    RolesModule,
    AuthModule,
    CategoriesModule,
    StockAdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
