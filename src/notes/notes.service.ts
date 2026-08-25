import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivitiesService } from '../activities/activities.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { NoteResponseDto } from './dto/note-response.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Note } from './entities/note.entity';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private readonly notesRepository: Repository<Note>,
    private readonly activitiesService: ActivitiesService,
  ) {}

  async findByActivity(activityId: string): Promise<NoteResponseDto[]> {
    await this.activitiesService.getEntityById(activityId, false);
    const notes = await this.notesRepository.find({
      where: { activityId },
      relations: { createdBy: true },
      order: { createdAt: 'ASC' },
    });
    return notes.map((note) => this.toResponse(note));
  }

  async create(
    activityId: string,
    createdById: string,
    dto: CreateNoteDto,
  ): Promise<NoteResponseDto> {
    await this.activitiesService.getEntityById(activityId, false);
    const saved = await this.notesRepository.save(
      this.notesRepository.create({
        activityId,
        createdById,
        content: dto.content.trim(),
      }),
    );
    return this.findById(saved.id);
  }

  async update(id: string, dto: UpdateNoteDto): Promise<NoteResponseDto> {
    const note = await this.getEntityById(id);
    if (dto.content !== undefined) {
      note.content = dto.content.trim();
    }
    await this.notesRepository.save(note);
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    const note = await this.getEntityById(id);
    await this.notesRepository.remove(note);
  }

  private async findById(id: string): Promise<NoteResponseDto> {
    return this.toResponse(await this.getEntityById(id));
  }

  private async getEntityById(id: string): Promise<Note> {
    const note = await this.notesRepository.findOne({
      where: { id },
      relations: { createdBy: true },
    });
    if (!note) {
      throw new NotFoundException('Note not found');
    }
    return note;
  }

  private toResponse(note: Note): NoteResponseDto {
    return {
      id: note.id,
      activityId: note.activityId,
      content: note.content,
      createdBy: {
        id: note.createdBy.id,
        name: note.createdBy.name,
      },
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  }
}
