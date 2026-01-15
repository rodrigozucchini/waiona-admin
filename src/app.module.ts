import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ProductsModule } from './products/products.module';
import { TaxesModule } from './pricing/taxes/taxes.module';
import { MarginsModule } from './pricing/margins/margins.module';
import { DiscountsModule } from './pricing/discounts/discounts.module';
import { TaxTypesModule } from './pricing/tax-types/tax-types.module';
import { DiscountTypesModule } from './pricing/discount-types/discount-types.module';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
