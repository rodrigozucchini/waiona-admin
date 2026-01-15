import { Module } from '@nestjs/common';
import { TaxTypeController } from './tax-types.controller';
import { TaxTypeService } from './tax-types.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaxTypeEntity } from './entities/tax-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TaxTypeEntity]), // 👈 REGISTRA EL REPO
  ],
  controllers: [TaxTypeController],
  providers: [TaxTypeService]
})
export class TaxTypesModule {}
