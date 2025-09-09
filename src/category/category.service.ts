import { Injectable, NotFoundException } from '@nestjs/common';
import { Category, Prisma } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './Dto/create-category.dto';
import { UpdateCategoryDto } from './Dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const { name, storeId } = createCategoryDto;

    // 1. Tente de trouver une catégorie existante avec le même nom et le même storeId.
    const existingCategory = await this.prisma.category.findUnique({
      where: {
        
          name: name,
          storeId: storeId,
      
      },
    });

    // 2. Si la catégorie existe, la retourne pour éviter l'erreur.
    if (existingCategory) {
      return existingCategory;
    }

    // 3. Sinon, crée une nouvelle catégorie.
    return this.prisma.category.create({
      data: {
        name: name,
        store: {
          connect: {
            id: storeId,
          },
        },
      },
    });
  }

  async findAll(): Promise<Category[]> {
    return this.prisma.category.findMany();
  }
  
  async getStoreCategory(storeId: string) {
    const strore = await this.prisma.store.findUnique({
      where:{ id: storeId},
      select:{categories:true,}
    })
    if (!strore) {
      throw new NotFoundException("Boutique non trouvée .");
    }
    return strore
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(
        `La catégorie avec l'ID ${id} est introuvable.`,
      );
    }

    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    try {
      const category = await this.prisma.category.update({
        where: { id },
        data: updateCategoryDto,
      });
      return category;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `La catégorie avec l'ID ${id} est introuvable.`,
        );
      }
      throw error;
    }
  }

  async remove(id: string): Promise<Category> {
    try {
      const category = await this.prisma.category.delete({
        where: { id },
        include: {
          products: true,
        },
      });
      return category;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `La catégorie avec l'ID ${id} est introuvable.`,
        );
      }
      throw error;
    }
  }
}
