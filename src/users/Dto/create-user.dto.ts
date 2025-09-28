// users/dto/create-user.dto.ts
import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Role } from 'generated/prisma';

export class CreateProfileDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  photoUrl?: string;

  @IsNumber()
  @IsOptional()
  phoneNumber?: number;

  @IsString()
  @IsOptional()
  bio?: string;
}

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsEnum(Role)
  role: Role;

  @ValidateNested()
  @Type(() => CreateProfileDto)
  @IsOptional()
  profile?: CreateProfileDto;
}
