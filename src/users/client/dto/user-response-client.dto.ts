import { Exclude } from 'class-transformer';
import { PersonType } from '../../../common/enums/person-type.enum';
import { DocumentType } from '../../../common/enums/document-type.enum';

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
  avatarUrl?: string;
  lastLoginAt?: Date;
  emailVerified: boolean;
}
