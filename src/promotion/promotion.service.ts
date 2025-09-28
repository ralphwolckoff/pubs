import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Promotion } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePromotionDto, UpdatePromotionDto } from './dto/create-promotion';


@Injectable()
export class PromotionService {
  constructor(private prisma: PrismaService) {}

  // Récupérer toutes les promotions, avec les infos de la boutique associée
  async findAll(): Promise<Promotion[]> {
    return this.prisma.promotion.findMany({
      include: { store: true, message: true, product: true },
    });
  }

  // Récupérer une promotion par ID
  async findOne(id: string): Promise<Promotion> {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id },
      include: { store: true },
    });
    if (!promotion) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }
    return promotion;
  }

  // Créer une nouvelle promotion pour une boutique spécifique
  async create(data: CreatePromotionDto): Promise<Promotion> {
    const { storeId, message, ...promoData } = data;

    // Assurez-vous que deadline est un objet Date
    const deadlineDate = new Date(promoData.deadline);
    const product = await this.prisma.product.findUnique({
      where: { name: promoData.productName },
    });
    if (!product) {
      throw new NotFoundException(
        `Product with name ${promoData.productName} not found`,
      );
    }

    try {
      const newPromotion = await this.prisma.promotion.create({
        data: {
          ...promoData,
          deadline: deadlineDate,
          store: {
            connect: { id: storeId },
          },
          // Ajout de la propriété 'product' requise par le schéma Prisma
          product: {
            connect: { id: product.id },
          },
          message: {
            create: {
              messageTitle: message.messageTitle,
              messageContent: message.messageContent,
            },
          },
        },
        include: { store: true, message: true, product: true },
      });
      return newPromotion;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Store with ID ${storeId} not found or data is invalid`,
        );
      }
      throw error;
    }
  }

  // Mettre à jour une promotion
  async update(
    id: string,
    data: UpdatePromotionDto,
  ): Promise<Promotion> {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id },
      include: { message: true },
    });
    if (!promotion) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }

    // 1. Préparer les données de mise à jour pour le modèle Promotion
    const updateData: Prisma.PromotionUpdateInput = {
      // Propagation des champs de base de la promotion
      productName: data.productName,
      discountPercentage: data.discountPercentage,
      finalPrice: data.finalPrice,
      // Conversion conditionnelle de la date
      deadline: data.deadline ? new Date(data.deadline) : undefined,
    };

    // 2. Logique pour la mise à jour du Message associé
    if (data.message) {
      if (!promotion.message) {
        throw new BadRequestException(
          `Cannot update message: Promotion ${id} does not have an associated message.`,
        );
      }

      // CORRECTION: Utilisation de l'écriture imbriquée 'update' pour Prisma
      updateData.message = {
        update: {
          // Pour une relation 1:1, vous pouvez utiliser la relation elle-même,
          // mais utiliser l'ID du message lié est aussi valide et plus explicite.
          where: { id: promotion.message.id },
          data: {
            messageTitle: data.message.messageTitle,
            messageContent: data.message.messageContent,
          },
        },
      };
    }

    // 3. Exécuter la mise à jour
    try {
      const updatedPromotion = await this.prisma.promotion.update({
        where: { id },
        data: updateData,
        include: { store: true, message: true},
      });
      return updatedPromotion 
    } catch (error) {
      throw error;
    }
  }

  // Supprimer une promotion
  async remove(id: string): Promise<Promotion> {
    const promotion = await this.prisma.promotion.findUnique({ where: { id } });
    if (!promotion) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }
    return this.prisma.promotion.delete({ where: { id } });
  }

  // Nouvelle méthode pour récupérer les promotions d'une boutique spécifique
  async findByStoreId(storeId: string): Promise<Promotion[]> {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      include: { promotions: 
        {include:{message:true}}
       },
    });
    return store?.promotions || [];
  }
}
