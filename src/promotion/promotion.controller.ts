import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Patch,
} from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { Promotion } from 'generated/prisma';
import { CreatePromotionDto, UpdatePromotionDto } from './dto/create-promotion';

@Controller('promotions')
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  @Get()
  async findAll(): Promise<Promotion[]> {
    return this.promotionService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Promotion> {
    return this.promotionService.findOne(id);
  }
  
  // Nouvelle route pour récupérer les promotions d'une boutique spécifique
  @Get('store/:storeId')
  async findByStoreId(@Param('storeId') storeId: string): Promise<Promotion[]> {
    return this.promotionService.findByStoreId(storeId);
  }
  
  @Post()
  async create(
    @Body() createPromotionDto: CreatePromotionDto,
  ): Promise<Promotion> {
    return this.promotionService.create(createPromotionDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePromotionDto: UpdatePromotionDto,
  ): Promise<Promotion> {
    return this.promotionService.update(id, updatePromotionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.promotionService.remove(id);
  }

}
