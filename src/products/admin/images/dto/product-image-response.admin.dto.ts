import { ImageResponseAdminDto } from './image-response.admin.dto';

export class ProductImageResponseAdminDto {
  id: number;
  productId: number;
  image: ImageResponseAdminDto;
}
