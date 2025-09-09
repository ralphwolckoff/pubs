// stores/dto/update-store.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateStoreDto } from './create-store.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateStoreDto extends PartialType(CreateStoreDto) {
  

  @IsString()
  @IsOptional()
  logo?: string;
}
