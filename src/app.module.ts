import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { ProductTypesModule } from './product-types/product-types.module';
import { TaxesModule } from './taxes/taxes.module';
import { MarginsModule } from './margins/margins.module';
import { DiscountsModule } from './discounts/discounts.module';

@Module({
  imports: [ProductsModule, ProductTypesModule, TaxesModule, MarginsModule, DiscountsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
