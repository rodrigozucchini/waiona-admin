import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

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
import { Env } from './env.model';

@Module({
  imports: [
    // 🔥 Config global
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 🔥 TypeORM usando variables de entorno
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env>) => ({
        type: 'postgres',
        host: config.get('POSTGRES_HOST', { infer: true }),
        port: config.get('POSTGRES_PORT', { infer: true }),
        username: config.get('POSTGRES_USER' , { infer: true }),
        password: config.get('POSTGRES_PASSWORD' , { infer: true }),
        database: config.get('POSTGRES_DB', { infer: true }),
        autoLoadEntities: true,
        synchronize: true, // solo dev
      }),
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
