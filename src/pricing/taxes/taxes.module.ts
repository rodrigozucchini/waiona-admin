import { Module } from '@nestjs/common';
import { TaxService } from './taxes.service';
import { TaxController } from './taxes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaxEntity } from './entities/tax.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TaxEntity]), // 👈 REGISTRA EL REPO
  ],
  controllers: [TaxController],
  providers: [TaxService],
})
export class TaxesModule {}
