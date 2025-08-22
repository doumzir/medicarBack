import { Injectable } from '@nestjs/common';
import { HealthEntry } from 'generated/prisma';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}
  async createNewHealthEntry(createHealthEntryData: Omit<HealthEntry, 'id' | 'createdAt'>): Promise<HealthEntry> {
    return await this.prisma.healthEntry.create({
      data: createHealthEntryData,
    });
  }

  getHealthEntries(userId: string, startDate?: string, endDate?: string): Promise<HealthEntry[]> {
    return this.prisma.healthEntry.findMany({
      where: {
        userId: userId, // Filtre par l'utilisateur connecté
        createdAt: {
          ...(startDate && { gte: new Date(startDate) }),
          lte: endDate ?? new Date(),
        },
      },
    });
  }



  async getPatientInfo({userId}: {userId: string}) {
    return await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        healthEntries: true,
        treatments: { take: 5 },
        appointments: true,
        firstName: true,
        notes: true,
      },
    });
  }

  async removeUser(id: string) {
    return await this.prisma.user.delete({
      where: { id },
    });
  }
}


