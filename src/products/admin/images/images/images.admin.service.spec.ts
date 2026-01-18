import { Test, TestingModule } from '@nestjs/testing';
import { ImageAdminService } from './images.admin.service';

describe('ImagesService', () => {
  let service: ImageAdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImageAdminService],
    }).compile();

    service = module.get<ImageAdminService>(ImageAdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
