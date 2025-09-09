// orders/orders.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Patch,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './Dto/create-order.dto';
import { UpdateOrderDto } from './Dto/update-order.dto';
import { OrderStatus } from 'generated/prisma';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Get(':id/store')
  async getStoreOrders(@Param('id') storeId: string) {
    return this.ordersService.getStoreOrders(storeId);
  }

  @Get(':id/client')
  async getClientOrder(@Param('id') clientId: string) {
    return this.ordersService.getClientOrder(clientId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Patch(':id/status')
  updateCommandStatus(
    @Param('id') id: string,
    @Body() newStatus: UpdateOrderDto
  ) {
    return this.ordersService.updateCommandStatus(id,newStatus );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
