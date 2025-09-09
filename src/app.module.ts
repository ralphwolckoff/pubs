import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StoreModule } from './store/store.module';
import { CategoryModule } from './category/category.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { AddressModule } from './address/address.module';

@Module({
  imports: [AuthModule, UsersModule, StoreModule, CategoryModule, ProductsModule, OrdersModule, AddressModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
