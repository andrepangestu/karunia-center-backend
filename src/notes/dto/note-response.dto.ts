import { ApiProperty } from '@nestjs/swagger';

export class NoteAuthorDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  name: string;
}

export class NoteResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  activityId: string;

  @ApiProperty()
  content: string;

  @ApiProperty({ type: NoteAuthorDto })
  createdBy: NoteAuthorDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
