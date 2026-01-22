import { PartialType } from '@nestjs/mapped-types';
import { CreateUserClientDto } from './create-user-client.dto';
import { IsOptional, IsString, MaxLength, IsEnum, MinLength } from 'class-validator';
import { PersonType } from 'src/common/enums/person-type.enum';
import { DocumentType } from 'src/common/enums/document-type.enum';

export class UpdateUserClientDto extends PartialType(CreateUserClientDto) {
  // ===== PERSON =====
  @IsOptional()
  @IsString()
  @MaxLength(80)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @IsOptional()
  @IsEnum(PersonType)
  type?: PersonType;

  @IsOptional()
  @IsEnum(DocumentType)
  documentType?: DocumentType;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  documentNumber?: string;

  // ===== USER =====
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  password?: string;
}
