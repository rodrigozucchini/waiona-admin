import { IsEnum } from 'class-validator';
import { UserStatus } from 'src/common/enums/user-status.enum';

export class ChangeUserStatusAdminDto {

  @IsEnum(UserStatus)
  status: UserStatus;
}
