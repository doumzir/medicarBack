import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';

@Module({
  providers: [PrismaService, NotesService],
  controllers: [NotesController],
})
export class NotesModule {} 