// orders/dto/update-order.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CreateOrderDto } from './create-order.dto';
import { OrderStatus } from 'generated/prisma';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @IsEnum(OrderStatus)
  @IsOptional()
  newStatus?: OrderStatus;

  @IsString()
  @IsOptional()
  storeId?: string;
}

