import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  ValidateNested,
} from 'class-validator';
import { ActivityType } from '../../common/enums/activity-type.enum';
import { DATE_PATTERN } from '../utils/time.util';
import { UpsertActivityItemDto } from './upsert-activity-item.dto';
import { UpsertActivityMaterialDto } from './upsert-activity-material.dto';

export class UpdateActivityDto {
  @ApiPropertyOptional({ enum: ActivityType, enumName: 'ActivityType' })
  @IsOptional()
  @IsEnum(ActivityType)
  activityType?: ActivityType;

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
      'Replace-set kegiatan. Omitted = keep existing. [] = remove all.',
  })
  @IsOptional()
  @IsArray()
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
