import { Module } from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { PromotionController } from './promotion.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [PromotionService, PrismaService],
  controllers: [PromotionController],
})
export class PromotionModule {}
