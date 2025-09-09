// products/products.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Product, Prisma, Image } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './Dto/create-product.dto';
import { UpdateProductDto } from './Dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const { images, ...productData } = createProductDto;
    try {
      return this.prisma.product.create({
        data: {
          ...productData,
          images: images
            ? {
                create: images.map((image) => ({
                  url: image.url,
                  altText: image.altText,
                })),
              }
            : undefined,
        },
        include: { images: true, category: true, store: true },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('This product already exists.');
      }
      throw error;
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ProductWhereUniqueInput;
    where?: Prisma.ProductWhereInput;
    orderBy?: Prisma.ProductOrderByWithRelationInput;
  }): Promise<Product[]> {
    const { skip, take, cursor, where, orderBy } = params;

    return this.prisma.product.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: { images: true, category: true, store: true },
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { images: true, category: true, store: true },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }
    return product;
  }

  async findByStore(storeId: string) {
    return this.prisma.product.findMany({
      where: { storeId },
      include: { images: true, category: true },
    });
  }

  async findByCategory(categoryId: string) {
    return this.prisma.product.findMany({
      where: { categoryId },
      include: { images: true, category: true, store: true },
    });
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const { images, ...productData } = updateProductDto;

    // Vérifier si le produit existe
    const productExists = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!productExists) {
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }

    const updateData: Prisma.ProductUpdateInput = { ...productData };

    if (images) {
      // Pour chaque image, soit on la met à jour si elle a un ID, soit on en crée une nouvelle.
      updateData.images = {
        upsert: images.map((imageDto) => ({
          where: { id: imageDto.id || 'invalid_id' },
          update: { url: imageDto.url, altText: imageDto.altText },
          create: { url: imageDto.url, altText: imageDto.altText },
        })),
      };
    }

    try {
      return this.prisma.product.update({
        where: { id },
        data: updateData,
        include: { images: true, category: true, store: true },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          'One of the referenced items for the update was not found.',
        );
      }
      throw error;
    }
  }

  async remove(id: string): Promise<Product> {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }
    return this.prisma.product.delete({ where: { id } });
  }

  async removeImage(imageId: string): Promise<Image> {
    try {
      return await this.prisma.image.delete({
        where: { id: imageId },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Image with ID ${imageId} not found.`);
      }
      throw error;
    }
  }
}
