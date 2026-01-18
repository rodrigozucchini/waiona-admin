import { Module } from '@nestjs/common';
import { TaxTypeAdminController } from './tax-types.admin.controller';
import { TaxTypeAdminService } from './tax-types.admin.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaxTypeEntity } from './entities/tax-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TaxTypeEntity]), // 👈 REGISTRA EL REPO
  ],
  controllers: [TaxTypeAdminController],
  providers: [TaxTypeAdminService]
})
export class TaxTypesModule {}
