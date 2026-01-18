import { Module } from '@nestjs/common';
import { TaxAdminService } from './taxes.admin.service';
import { TaxAdminController } from './taxes.admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaxEntity } from './entities/tax.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TaxEntity]), // 👈 REGISTRA EL REPO
  ],
  controllers: [TaxAdminController],
  providers: [TaxAdminService],
})
export class TaxesModule {}
