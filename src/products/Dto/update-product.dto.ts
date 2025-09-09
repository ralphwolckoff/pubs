// products/dto/update-product.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateProductDto, CreateImageDto } from './create-product.dto';

// DTO pour une image, incluant un ID pour les mises à jour
export class UpdateImageDto extends PartialType(CreateImageDto) {
  @IsString()
  @IsOptional()
  id?: string;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {
  
}
