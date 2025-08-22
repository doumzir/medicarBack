import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { Appointment } from 'generated/prisma';
import { AppointmentsService } from './appointments.service';

@Controller('patients/:patientId/appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  async createAppointment(@Body() createAppointmentData: Omit<Appointment, 'id' | 'createdAt'>) {
    return await this.appointmentsService.createAppointment(createAppointmentData);
  }

  @Get()
  async getAppointments(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return await this.appointmentsService.getAppointments(startDate, endDate);
  }

  @Get(':id')
  async getAppointment(@Query('id') id: string) {
    return await this.appointmentsService.getAppointment(id);
  }

  @Delete()
  async deleteAppointment(@Query('id') id: string) {
    return await this.appointmentsService.deleteAppointment(id);
  }
} 