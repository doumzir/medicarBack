import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { Treatment } from 'generated/prisma';
import { TreatmentsService } from './treatments.service';

@Controller('patients/:patientId/treatments')
export class TreatmentsController {
  constructor(private readonly treatmentsService: TreatmentsService) {}

  @Post()
  async createTreatment(@Body() createTreatmentData: Omit<Treatment, 'id' | 'createdAt'>) {
    return await this.treatmentsService.createTreatment(createTreatmentData);
  }

  @Get()
  async getTreatments(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return await this.treatmentsService.getTreatments(startDate, endDate);
  }

  @Delete()
  async deleteTreatment(@Query('id') id: string) {
    return await this.treatmentsService.deleteTreatment(id);
  }
} 