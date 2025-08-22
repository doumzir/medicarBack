import { Injectable } from '@nestjs/common';
import { Appointment } from 'generated/prisma';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createAppointment(createAppointmentData: Omit<Appointment, 'id' | 'createdAt'>) {
    return await this.prisma.appointment.create({
      data: createAppointmentData,
    });
  }

  async getAppointments(startDate?: string, endDate?: string) {
    return await this.prisma.appointment.findMany({
      where: {
        createdAt: {
          ...(startDate && { gte: new Date(startDate) }),
          lte: endDate ?? new Date(),
        },
      },
    });
  }

  async getAppointment(id: string) {
    return await this.prisma.appointment.findUnique({
      where: { id },
    });
  }

  async deleteAppointment(id: string) {
    return await this.prisma.appointment.delete({
      where: { id },
    });
  }
} 