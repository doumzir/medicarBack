import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';

@Module({
  providers: [PrismaService, AppointmentsService],
  controllers: [AppointmentsController],
})
export class AppointmentsModule {} 