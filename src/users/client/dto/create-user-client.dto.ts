import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { PersonType } from 'src/common/enums/person-type.enum';
import { DocumentType } from 'src/common/enums/document-type.enum';

export class CreateUserClientDto {
  // ===== PERSON =====
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  lastName: string;

  @IsEmail()
  @MaxLength(100)
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @IsEnum(PersonType)
  type: PersonType; // NATURAL | COMPANY

  @IsOptional()
  @IsEnum(DocumentType)
  documentType?: DocumentType;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  documentNumber?: string;

  // ===== USER =====
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  password: string;
}
