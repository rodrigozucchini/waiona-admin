import { Exclude } from 'class-transformer';
import { PersonType } from 'src/common/enums/person-type.enum';
import { DocumentType } from 'src/common/enums/document-type.enum';

export class UserResponseClientDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  type: PersonType;
  documentType?: DocumentType;
  documentNumber?: string;
  lastLoginAt?: Date;
  emailVerified: boolean;
}
