import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
import { ActivityItemDto } from './activity-item.dto';
import { ActivityMaterialDto } from './activity-material.dto';
import { DATE_PATTERN } from '../utils/time.util';

export class CreateActivityDto {
  @ApiProperty({
    enum: ActivityType,
    enumName: 'ActivityType',
    example: ActivityType.PAGI,
  })
  @IsEnum(ActivityType)
  activityType: ActivityType;

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

  @ApiPropertyOptional({ type: [ActivityItemDto], description: 'Kegiatan' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActivityItemDto)
  items?: ActivityItemDto[];

  @ApiPropertyOptional({ type: [ActivityMaterialDto], description: 'Materi' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActivityMaterialDto)
  materials?: ActivityMaterialDto[];
}
