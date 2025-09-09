import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { StoresService } from './store.service';
import { StoresController } from './store.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [StoresService, PrismaService],
  controllers: [StoresController],
})
export class StoreModule {}
