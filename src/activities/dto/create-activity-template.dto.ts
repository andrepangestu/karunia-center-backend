import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { TIME_PATTERN } from '../utils/time.util';
import { ActivityTemplateItemDto } from './activity-template-item.dto';

export class CreateActivityTemplateDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  activityTypeId: string;

  @ApiProperty({ example: 'Bangun tidur' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @ApiProperty({ example: '04:45', description: 'HH:mm or HH:mm:ss' })
  @IsString()
  @Matches(TIME_PATTERN, { message: 'startTime must be HH:mm or HH:mm:ss' })
  startTime: string;

  @ApiProperty({ example: '05:30', description: 'HH:mm or HH:mm:ss' })
  @IsString()
  @Matches(TIME_PATTERN, { message: 'endTime must be HH:mm or HH:mm:ss' })
  endTime: string;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @Type(() => Number)
  sortOrder?: number;

  @ApiPropertyOptional({
    type: [ActivityTemplateItemDto],
    description: 'Kegiatan checklist under this materi slot',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActivityTemplateItemDto)
  items?: ActivityTemplateItemDto[];
}
