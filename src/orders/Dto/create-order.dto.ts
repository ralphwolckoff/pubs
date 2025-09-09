// orders/dto/create-order.dto.ts
import { IsString, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @IsString()
  productId: string;

  @IsNumber()
  quantity: number;
}

export class CreateOrderDto {
  @IsString()
  userId: string;

  @IsString()
  addressId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}


// // orders/dto/create-order.dto.ts
// import {
//   IsString,
//   IsNumber,
//   IsArray,
//   ValidateNested,
//   IsUUID,
// } from 'class-validator';
// import { Type } from 'class-transformer';

// export class CreateOrderItemDto {
//   @IsUUID()
//   productId: string;

//   @IsNumber()
//   quantity: number;
// }

// export class CreateOrderDto {
//   @IsUUID()
//   userId: string;

//   @IsUUID()
//   addressId: string;

//   @IsArray()
//   @ValidateNested({ each: true })
//   @Type(() => CreateOrderItemDto)
//   items: CreateOrderItemDto[];
// }
