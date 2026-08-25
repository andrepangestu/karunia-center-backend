import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivitiesModule } from '../activities/activities.module';
import { Note } from './entities/note.entity';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Note]), ActivitiesModule],
  controllers: [NotesController],
  providers: [NotesService],
  exports: [NotesService, TypeOrmModule],
})
export class NotesModule {}
