import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { TreatmentsController } from './treatments.controller';
import { TreatmentsService } from './treatments.service';

@Module({
  providers: [PrismaService, TreatmentsService],
  controllers: [TreatmentsController],
})
export class TreatmentsModule {} 