import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
import { ActivityMaterialDto } from './activity-material.dto';
import { DATE_PATTERN } from '../utils/time.util';
import { SubmitActivityItemDto } from './submit-activity-item.dto';

export class CreateActivityDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  activityTypeId: string;

  @ApiProperty({ example: '2026-08-17' })
  @Matches(DATE_PATTERN, { message: 'activityDate must be YYYY-MM-DD' })
  activityDate: string;

  @ApiProperty({ format: 'uuid', description: 'User with role PENDAMPING' })
  @IsUUID()
  companionId: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  studentId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    type: [SubmitActivityItemDto],
    description:
      'Required kegiatan scores. Use templateItemId for catalog items. All catalog kegiatan for this activity type must be scored.',
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Kegiatan scores are required' })
  @ValidateNested({ each: true })
  @Type(() => SubmitActivityItemDto)
  items: SubmitActivityItemDto[];

  @ApiPropertyOptional({
    type: [ActivityMaterialDto],
    description:
      'Omitted = copy materi slots from the activity-templates catalog for this activity type.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActivityMaterialDto)
  materials?: ActivityMaterialDto[];
}
