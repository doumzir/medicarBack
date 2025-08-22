import { Body, Controller, Delete, Get, Post, Query, Request, UseGuards } from '@nestjs/common';
import { HealthEntry } from 'generated/prisma';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RequestUser } from 'src/auth/jwt.strategy';

import { PrismaService } from 'src/prisma.service';
import { PatientsService } from './patients.service';

@UseGuards(JwtAuthGuard)
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService, private readonly prisma: PrismaService) {}

  @Get()
  async getPatientInfo(@Request() request: RequestUser) {
    return await this.patientsService.getPatientInfo({ userId: request.user.userId });
  }
  @Post('health-entry')
  async createNewHealthEntry(
    @Body() createHealthEntryData: Omit<HealthEntry, 'id' | 'createdAt' | 'userId'>,
    @Request() request: RequestUser
  ) {
    return await this.patientsService.createNewHealthEntry({
      ...createHealthEntryData,
      userId: request.user.userId,
    });
  }

  @Get('health-entries')
  async getHealthEntries(
    @Request() request: RequestUser,
    @Query('startDate') startDate?: string, 
    @Query('endDate') endDate?: string
  ) {
    return await this.patientsService.getHealthEntries(request.user.userId, startDate, endDate);
  }

  @Delete('delete-account')
  async remove(@Request() request: RequestUser) {
    return await this.patientsService.removeUser(request.user.userId);
  }
  
}