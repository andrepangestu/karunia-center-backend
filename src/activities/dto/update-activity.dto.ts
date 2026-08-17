import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  ValidateNested,
} from 'class-validator';
import { DATE_PATTERN } from '../utils/time.util';
import { UpsertActivityItemDto } from './upsert-activity-item.dto';
import { UpsertActivityMaterialDto } from './upsert-activity-material.dto';

export class UpdateActivityDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  activityTypeId?: string;

  @ApiPropertyOptional({ example: '2026-08-17' })
  @IsOptional()
  @Matches(DATE_PATTERN, { message: 'activityDate must be YYYY-MM-DD' })
  activityDate?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  companionId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    type: [UpsertActivityItemDto],
    description:
      'Replace-set kegiatan. Omitted = keep existing. Empty array is not allowed.',
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'Kegiatan scores are required' })
  @ValidateNested({ each: true })
  @Type(() => UpsertActivityItemDto)
  items?: UpsertActivityItemDto[];

  @ApiPropertyOptional({
    type: [UpsertActivityMaterialDto],
    description:
      'Replace-set materi. Omitted = keep existing. [] = remove all.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertActivityMaterialDto)
  materials?: UpsertActivityMaterialDto[];
}
