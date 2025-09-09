// stores/stores.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Store, Prisma } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStoreDto } from './Dto/create-store.dto';
import { UpdateStoreDto } from './Dto/update-store.dto';

@Injectable()
export class StoresService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createStoreDto: CreateStoreDto): Promise<Store> {
    const { ...storeData } = createStoreDto;
    try {
      return this.prisma.store.create({
        data: {
          ...storeData,
          user: { connect: { id: userId } },
        },
        include: { user: true, products: true },
      });
    } catch (error) {
      // Gérer l'erreur si le nom de la boutique est déjà utilisé (unique)
      if (error.code === 'P2002' && error.meta?.target.includes('name')) {
        throw new BadRequestException('Ce nom de boutique est déjà pris.');
      }
      // Gérer l'erreur si l'utilisateur a déjà une boutique (unique)
      if (error.code === 'P2002' && error.meta?.target.includes('userId')) {
        throw new BadRequestException('Cet utilisateur a déjà une boutique.');
      }
      throw error;
    }
  }

  async findAll(): Promise<Store[]> {
    return this.prisma.store.findMany({
      include: { user: true, products: true },
    });
  }

  async findOne(id: string): Promise<Store> {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: { user: true, products: true },
    });

    if (!store) {
      throw new NotFoundException(
        `Le magasin avec l'ID ${id} est introuvable.`,
      );
    }

    return store;
  }

  async findStoreWithProducts(id: string) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });
    if (!store) {
      throw new NotFoundException(
        `La boutique avec l'ID ${id} n'a pas été trouvée.`,
      );
    }
    return store;
  }

  async findByUserId(userId: string) {
    const store = await this.prisma.store.findUnique({
      where: { userId },
    });
    if (!store) {
      throw new NotFoundException(
        `Aucune boutique n'a été trouvée pour cet utilisateur.`,
      );
    }
    return store;
  }

  async update(id: string, userId: string, updateStoreDto: UpdateStoreDto): Promise<Store> {
    const {  ...storeData } = updateStoreDto;

    // Vérifier si le magasin existe
    const storeExists = await this.prisma.store.findUnique({ where: { id } });
    if (!storeExists) {
      throw new NotFoundException(
        `Le magasin avec l'ID ${id} est introuvable.`,
      );
    }

    const updateData: Prisma.StoreUpdateInput = { ...storeData };

    if (userId) {
      updateData.user = { connect: { id: userId } };
    }

    try {
      return this.prisma.store.update({
        where: { id },
        data: updateData,
        include: { user: true, products: true },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          'Un des éléments de référence pour la mise à jour est introuvable.',
        );
      }
      throw error;
    }
  }

  async remove(id: string): Promise<Store> {
    const store = await this.prisma.store.findUnique({ where: { id } });
    if (!store) {
      throw new NotFoundException(
        `Le magasin avec l'ID ${id} est introuvable.`,
      );
    }
    return this.prisma.store.delete({ where: { id } });
  }
}
