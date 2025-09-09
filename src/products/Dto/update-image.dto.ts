// products/dto/update-image.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateImageDto } from './create-product.dto';

export class UpdateImageDto extends PartialType(CreateImageDto) {}
