import { Test, TestingModule } from '@nestjs/testing';
import { MarginsController } from './margins.controller';
import { MarginsService } from './margins.service';

describe('MarginsController', () => {
  let controller: MarginsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarginsController],
      providers: [MarginsService],
    }).compile();

    controller = module.get<MarginsController>(MarginsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
