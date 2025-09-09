// orders/orders.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { Order, OrderStatus, Prisma } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto } from './Dto/create-order.dto';
import { UpdateOrderDto } from './Dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const { items, ...orderData } = createOrderDto;

    if (items.length === 0) {
      throw new BadRequestException(
        'Une commande doit contenir au moins un article.',
      );
    }

    const productIds = items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        price: true,
        stock: true,
        images: true,
        storeId: true,
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));
    const storeMap = new Map<string, { totalAmount: number; items: any[] }>();

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new NotFoundException(
          `Produit avec ID ${item.productId} introuvable.`,
        );
      }
      if (item.quantity <= 0) {
        throw new BadRequestException(
          `La quantité de l'article avec ID ${item.productId} doit être positive.`,
        );
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Stock insuffisant pour le produit ID ${item.productId}. Stock disponible: ${product.stock}`,
        );
      }

      const priceAtOrder = Number(product.price);
      const storeId = product.storeId;

      if (!storeMap.has(storeId)) {
        storeMap.set(storeId, { totalAmount: 0, items: [] });
      }

      const storeOrder = storeMap.get(storeId)!;
      storeOrder.totalAmount += priceAtOrder * item.quantity;
      storeOrder.items.push({
        productId: item.productId,
        quantity: item.quantity,
        priceAtOrder,
      });
    }
    const address = await this.prisma.address.findUnique({
      where: { id: orderData.addressId },
      include: { user: true },
    });
    if (!address) {
      throw new NotFoundException(
        `Adresse avec ID ${orderData.addressId} introuvable.`,
      );
    }

    return this.prisma.$transaction(async (prisma) => {
      const createdOrders: Order[] = [];
      for (const [storeId, storeOrder] of storeMap.entries()) {
        const order = await prisma.order.create({
          data: {
            ...orderData,
            storeId: storeId,
            totalAmount: storeOrder.totalAmount,
            items: {
              create: storeOrder.items,
            },
          },
          include: {
            items: { include: { product: true } },
            user: true,
            store: true,
            address: true, // ⚠️ AJOUT : Inclure l'adresse
          },
        });
        createdOrders.push(order);
      }
      await Promise.all(
        items.map(async (item) => {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: item.quantity },
            },
          });
        }),
      );
      return createdOrders[0];
    });
  }

  async findAll(): Promise<Order[]> {
    return this.prisma.order.findMany({
      include: {
        items: { include: { product: true } },
        user: true,
        store: true,
      },
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        user: true,
        store: true,
      },
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found.`);
    }
    return order;
  }

  async getStoreOrders(storeId: string) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });
    if (!store) {
      throw new NotFoundException("store don't exist");
    }
    return this.prisma.order.findMany({
      where: { storeId: storeId },
      include: {
        items: { include: { product: { include: { images: true } } } },
        user: {include:{profile:true}},
        store: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getClientOrder(clientId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: clientId },
      include: { orders: true },
    });
    if (!user) {
      throw new NotFoundException("user don't exist");
    }
    const clientOrder = this.prisma.order.findMany({
      where: { userId: clientId },
      include:{store:true,items:{ include:{product:{include:{images:true}}}}}
    });
    return clientOrder;
  }

  //   async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
  //   const order = await this.prisma.order.findUnique({ where: { id } });
  //   if (!order) {
  //     throw new NotFoundException(`Order with ID ${id} not found.`);
  //   }
  //     return this.prisma.order.update({
  //       where: { id },
  //       data: updateOrderDto,
  //       include: { items: true, user: true, store: true },
  //     });
  //   }

  async updateCommandStatus(
    orderId: string,
    newStatus: UpdateOrderDto,
  ): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include:{store:true}
    });

    if (!order) {
      throw new NotFoundException(
        `Order item with ID "${orderId}" not found.`,
      );
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus.newStatus },
      include: {
        user:true,
        address:true,
        items: true,
        store: { select: { id: true, name: true } },
      },
    });


    return updatedOrder;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found.`);
    }
    try {
      await this.prisma.order.update({
        where: { id },
        data: updateOrderDto as Prisma.OrderUpdateInput,
      });
      return order;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `La commande avec l'ID ${id} est introuvable ou un champ n'existe pas.`,
        );
      }
      throw error;
    }
  }
  async remove(id: string): Promise<Order> {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found.`);
    }
    return this.prisma.order.delete({ where: { id } });
  }
}
