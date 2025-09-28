// users/users.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateProfileDto, CreateUserDto } from './Dto/create-user.dto';
import { Profile, Role, User } from 'generated/prisma';
import { UpdateProfileDto, UpdateUserDto } from './Dto/update-user.dto';
type UserWithoutPassword = Omit<User, 'password'>;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { profile, password, ...userData } = createUserDto;

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      return this.prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword,
          profile: profile ? { create: profile } : undefined,
        },
        include: { profile: true, store:true,address:true },
      });
    } catch (error) {
      if (error.code === 'P2002' && error.meta?.target.includes('email')) {
        throw new BadRequestException('Cet email est déjà utilisé.');
      }
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({
      include: { profile: true, store: true, orders: true },
    });
  }

  async findOne( id: string ): Promise<UserWithoutPassword> {
    if (!id) {
      throw new BadRequestException(`the ID ${id} not found, give the right ID.`);
    }
    const user = await this.prisma.user.findUnique({
      where: { id: id },
      include: { profile: true,address:true, store: true, orders: true },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${user} not found.`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { email: email },
      include: { profile: true },
    });
    if (!user) {
      throw new NotFoundException(`User with ID "${email}" not found.`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const { profile, store, password, ...userData } = updateUserDto;
    const updateData: any = { ...userData };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (profile) {
      updateData.profile = {
        update: profile,
      };
    }



    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      include: { profile: true, store: true,address:true, orders: true },
    });
  }

  async updateRole(
    userId: string,
    newRole: Role,
    profile?: UpdateProfileDto
  ): Promise<UserWithoutPassword> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found.`);
    }

    if (user.role === Role.ADMIN && newRole !== Role.ADMIN) {
      throw new BadRequestException('Cannot change role of an ADMIN user.');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { role: newRole, profile: profile ? { update: profile } : undefined },
    });
    return updatedUser;
  }

  async updateProfile(
    userId: string,
    updateProfileDto: CreateProfileDto,
  ): Promise<Profile> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        profile: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (!user.profile) {
      return this.prisma.profile.create({
        data: {
          userId: user.id,
          ...updateProfileDto,
          firstName: updateProfileDto.firstName,
          lastName:updateProfileDto.lastName,
        },
      });
    } else {
      return this.prisma.profile.update({
        where: { userId: userId },
        data: updateProfileDto,
      });
    }
  }

  async remove(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    return this.prisma.user.delete({ where: { id } });
  }
}
