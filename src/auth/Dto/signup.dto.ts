import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AuthCredentialsDto } from './login.dto';
import { CreateProfileDto } from 'src/users/Dto/create-user.dto';

export class RegisterAuthDto {
  @ValidateNested()
  @Type(() => AuthCredentialsDto)
  user: AuthCredentialsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateProfileDto)
  profile?: CreateProfileDto;
}
