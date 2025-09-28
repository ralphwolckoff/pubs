// users/dto/update-user.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import {
  IsString,
  IsEnum,
  IsOptional,
  ValidateNested,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateUserDto } from './create-user.dto';
import { Role } from 'generated/prisma';
import { CreateStoreDto } from 'src/store/Dto/create-store.dto';

export class UpdateProfileDto {
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

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @IsBoolean()
  @IsOptional()
  onboardingIsCompleted?: boolean
 

  @ValidateNested()
  @Type(() => CreateStoreDto)
  @IsOptional()
  store?: CreateStoreDto;
}
