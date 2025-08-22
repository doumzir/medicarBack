import { Injectable } from '@nestjs/common';
import { Treatment } from 'generated/prisma';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TreatmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createTreatment(createTreatmentData: Omit<Treatment, 'id' | 'createdAt'>) {
    return await this.prisma.treatment.create({
      data: createTreatmentData,
    });
  }

  async getTreatments(startDate?: string, endDate?: string) {
    return await this.prisma.treatment.findMany({
      where: {
        createdAt: {
          ...(startDate && { gte: new Date(startDate) }),
          lte: endDate ?? new Date(),
        },
      },
    });
  }

  async deleteTreatment(id: string) {
    return await this.prisma.treatment.delete({
      where: { id },
    });
  }
} 