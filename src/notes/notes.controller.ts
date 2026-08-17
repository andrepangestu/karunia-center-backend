import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SWAGGER_ACCESS_TOKEN } from '../common/constants/auth.constants';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { CreateNoteDto } from './dto/create-note.dto';
import { NoteResponseDto } from './dto/note-response.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NotesService } from './notes.service';

@ApiTags('Notes')
@ApiBearerAuth(SWAGGER_ACCESS_TOKEN)
@Roles(UserRole.ADMIN, UserRole.PENDAMPING)
@Controller()
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get('activities/:activityId/notes')
  @ApiOperation({ summary: 'List notes for an activity' })
  @ApiParam({ name: 'activityId', format: 'uuid' })
  @ApiResponse({ status: 200, type: [NoteResponseDto] })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  findByActivity(@Param('activityId', ParseUUIDPipe) activityId: string) {
    return this.notesService.findByActivity(activityId);
  }

  @Post('activities/:activityId/notes')
  @ApiOperation({ summary: 'Add a note to an activity' })
  @ApiParam({ name: 'activityId', format: 'uuid' })
  @ApiResponse({ status: 201, type: NoteResponseDto })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  create(
    @Param('activityId', ParseUUIDPipe) activityId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateNoteDto,
  ) {
    return this.notesService.create(activityId, user.id, dto);
  }

  @Patch('notes/:id')
  @ApiOperation({ summary: 'Update a note' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: NoteResponseDto })
  @ApiResponse({ status: 404, description: 'Note not found' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateNoteDto) {
    return this.notesService.update(id, dto);
  }

  @Delete('notes/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a note' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Note deleted' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.notesService.remove(id);
    return { id };
  }
}
