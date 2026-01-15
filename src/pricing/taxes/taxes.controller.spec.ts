import { Test, TestingModule } from '@nestjs/testing';
import { TaxController } from './taxes.controller';
import { TaxService } from './taxes.service';

describe('TaxesController', () => {
  let controller: TaxController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaxController],
      providers: [TaxService],
    }).compile();

    controller = module.get<TaxController>(TaxController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
