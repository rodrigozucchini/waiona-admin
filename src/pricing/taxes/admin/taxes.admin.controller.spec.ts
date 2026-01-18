import { Test, TestingModule } from '@nestjs/testing';
import { TaxAdminController } from './taxes.admin.controller';
import { TaxAdminService } from './taxes.admin.service';

describe('TaxesController', () => {
  let controller: TaxAdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaxAdminController],
      providers: [TaxAdminService],
    }).compile();

    controller = module.get<TaxAdminController>(TaxAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
