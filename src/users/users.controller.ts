// users/users.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  UseGuards,
  UnauthorizedException,
  Request,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateProfileDto, CreateUserDto } from './Dto/create-user.dto';
import { UpdateProfileDto, UpdateUserDto } from './Dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Profile, Role } from 'generated/prisma';
import { IsEnum } from 'class-validator';
import { RequestWithUser } from 'src/auth/strategies/jwt.strategy';

class UpdateUserRoleDto {
  @IsEnum(Role)
  newRole: Role;
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  // @Roles(Role.ADMIN, Role.CLIENT, Role.VENDOR)
  async findOne(@Param('id') userId: string, @Request() req: RequestWithUser) {
    if (req.user.role !== Role.ADMIN && req.user.id !== userId) {
      throw new UnauthorizedException(
        'You are not authorized to view this user profile.',
      );
    }
    return await this.usersService.findOne(userId);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async findByEmail(@Request() req: RequestWithUser) {
    const email = req.user.email;
    return await this.usersService.findByEmail(email);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN || Role.VENDOR || Role.CLIENT)
  async updateRole(
    @Param('id') userId: string,
    @Body() updateRoleDto: UpdateUserRoleDto,
    @Body() profile?: UpdateProfileDto,
  ) {
    return this.usersService.updateRole(userId, updateRoleDto.newRole, profile);
  }

  @Patch(':userId/profile')
  async createOrUpdateProfile(
    @Param('userId') userId: string,
    @Body() createProfileDto: CreateProfileDto,
  ): Promise<Profile> {
    return this.usersService.updateProfile(userId, createProfileDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    if (!id) {
      throw new BadRequestException('User ID is required for removal.');
    }
    return this.usersService.remove(id);
  }
}
