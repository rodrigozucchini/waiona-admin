export class CategoryResponseAdminDto {
    id: number;
    name: string;
  
    parent?: {
      id: number;
      name: string;
    } | null;
  
    createdAt: Date;
    updatedAt: Date;
  }
  