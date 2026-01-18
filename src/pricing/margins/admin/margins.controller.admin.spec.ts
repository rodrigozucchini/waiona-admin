import { Test, TestingModule } from '@nestjs/testing';
import { MarginAdminController } from './margins.admin.controller';
import { MarginAdminService } from './margins.admin.service';

describe('MarginsController', () => {
  let controller: MarginAdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarginAdminController],
      providers: [MarginAdminService],
    }).compile();

    controller = module.get<MarginAdminController>(MarginAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
