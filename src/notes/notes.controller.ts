import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { Note } from 'generated/prisma';
import { NotesService } from './notes.service';

@Controller('patients/:patientId/notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  async createNote(@Body() createNoteData: Omit<Note, 'id' | 'createdAt'>) {
    return await this.notesService.createNote(createNoteData);
  }

  @Get()
  async getNotes() {
    return await this.notesService.getNotes();
  }

  @Delete()
  async deleteNote(@Query('id') id: string, @Query('userId') userId: string) {
    return await this.notesService.deleteNote(id, userId);
  }
} 