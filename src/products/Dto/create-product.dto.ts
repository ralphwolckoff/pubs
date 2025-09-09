// products/dto/create-product.dto.ts
import {
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsOptional,
  IsNotEmpty,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';

// DTO pour une image, aligné avec le schéma Prisma
export class CreateImageDto {
  
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsNotEmpty()
  altText: string;
}

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  price: number;

  @IsNumber()
  stock: number;

  @IsString()
  storeId: string;

  @IsString()
  @IsOptional()
  categoryId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateImageDto)
  images: CreateImageDto[];
}
