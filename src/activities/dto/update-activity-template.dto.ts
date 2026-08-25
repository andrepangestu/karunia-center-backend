import { ApiPropertyOptional } from '@nestjs/swagger';
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
import { UpsertActivityTemplateItemDto } from './upsert-activity-template-item.dto';

export class UpdateActivityTemplateDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  activityTypeId?: string;

  @ApiPropertyOptional({ example: 'Bangun tidur' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name?: string;

  @ApiPropertyOptional({ example: '04:45' })
  @IsOptional()
  @IsString()
  @Matches(TIME_PATTERN, { message: 'startTime must be HH:mm or HH:mm:ss' })
  startTime?: string;

  @ApiPropertyOptional({ example: '05:30' })
  @IsOptional()
  @IsString()
  @Matches(TIME_PATTERN, { message: 'endTime must be HH:mm or HH:mm:ss' })
  endTime?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  sortOrder?: number;

  @ApiPropertyOptional({
    type: [UpsertActivityTemplateItemDto],
    description:
      'Replace-set kegiatan. Omitted = keep existing. [] = remove all.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertActivityTemplateItemDto)
  items?: UpsertActivityTemplateItemDto[];
}
