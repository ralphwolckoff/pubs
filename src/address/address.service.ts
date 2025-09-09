import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAddressDto } from './Dto/create-address.dto';
import { UpdateAddressDto } from './Dto/update-address.dto';

@Injectable()
export class AddressService {
  constructor(private prisma: PrismaService) {}

  
  async create(userId: string, createAddressDto: CreateAddressDto) {
    const existingAddress = await this.prisma.address.findUnique({
      where: { userId },
    });

    if (existingAddress) {
      return this.prisma.address.update({
        where: { userId },
        data: createAddressDto,
      });
    }

    return this.prisma.address.create({
      data: {
        ...createAddressDto,
        user: {
          connect: { id: userId },
        },
      },
    });
  }

  
  async findOneByUserId(userId: string) {
    const address = await this.prisma.address.findUnique({
      where: { userId },
    });
    if (!address) {
      throw new NotFoundException(
        `Adresse de l'utilisateur avec l'ID ${userId} non trouvée.`,
      );
    }
    return address;
  }

 
  async update(userId: string, updateAddressDto: UpdateAddressDto) {
    try {
      return await this.prisma.address.update({
        where: { userId },
        data: updateAddressDto,
      });
    } catch (error) {
      throw new NotFoundException(
        `Impossible de mettre à jour l'adresse. L'adresse de l'utilisateur avec l'ID ${userId} n'existe pas.`,
      );
    }
  }
}
