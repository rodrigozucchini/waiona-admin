import { Test, TestingModule } from '@nestjs/testing';
import { TaxTypeAdminController } from './tax-types.admin.controller';

describe('TaxTypesController', () => {
  let controller: TaxTypeAdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaxTypeAdminController],
    }).compile();

    controller = module.get<TaxTypeAdminController>(TaxTypeAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
