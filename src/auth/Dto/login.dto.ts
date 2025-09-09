import { PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from 'src/users/Dto/create-user.dto';

export class LoginDto extends PickType(CreateUserDto, [
  'email',
  'password',
] as const) {}
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { Role } from 'generated/prisma';
import {
  EMAIL_REGEX,
  EMAIL_VALIDATION_MESSAGE,
  PASSWORD_REGEX,
  PASSWORD_VALIDATION_MESSAGE,
} from 'src/common/regex.constants';

export class AuthCredentialsDto {
  @IsNotEmpty()
  @IsEmail({}, { message: EMAIL_VALIDATION_MESSAGE })
  @Matches(EMAIL_REGEX, { message: EMAIL_VALIDATION_MESSAGE })
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(PASSWORD_REGEX, { message: PASSWORD_VALIDATION_MESSAGE })
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 6 caractères.',
  })
  password: string;

  

  @IsString()
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
