import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateNoteDto {
  @ApiProperty({ example: 'Siswa lebih mandiri saat sarapan.' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
