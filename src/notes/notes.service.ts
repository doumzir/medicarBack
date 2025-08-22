import { Injectable } from '@nestjs/common';
import { Note } from 'generated/prisma';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  async createNote(createNoteData: Omit<Note, 'id' | 'createdAt'>) {
    return await this.prisma.note.create({
      data: createNoteData,
    });
  }

  async getNotes() {
    return await this.prisma.note.findMany();
  }

  async deleteNote(id: string, userId: string) {
    return await this.prisma.note.delete({
      where: { id, userId },
    });
  }
} 