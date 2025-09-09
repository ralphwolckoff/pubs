// stores/stores.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Request,
  UseGuards,
  Query,
  BadRequestException,
  Patch,
} from '@nestjs/common';
import { CreateStoreDto } from './Dto/create-store.dto';
import { UpdateStoreDto } from './Dto/update-store.dto';

// Importation nécessaire pour la protection des routes
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'; // Exemple pour un JWT Guard
import { StoresService } from './store.service';
import { RequestWithUser } from 'src/auth/strategies/jwt.strategy';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @UseGuards(JwtAuthGuard) 
  @Post()
  create(@Request() req: RequestWithUser , @Body() createStoreDto: CreateStoreDto) {
    const userId = req.user.id;
    return this.storesService.create(userId, createStoreDto);
  }

  @Get()
  findAll() {
    return this.storesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  findUserStore(@Request() req) {
    const userId = req.user.id;
    return this.storesService.findByUserId(userId);
  }

  
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('includeProducts') includeProducts: string,
  ) {
    const include = includeProducts === 'true';
    if (include) {
      return this.storesService.findStoreWithProducts(id);
    }
    return this.storesService.findOne(id);
  }


  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
    @Body() updateStoreDto: UpdateStoreDto,
  ) {
    const userId = req.user.id;
    return this.storesService.update(id, userId, updateStoreDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.storesService.remove(id);
  }
}
