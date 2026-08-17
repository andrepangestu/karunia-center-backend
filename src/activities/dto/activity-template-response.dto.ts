import { ApiProperty } from '@nestjs/swagger';
import { ActivityTypeResponseDto } from './activity-type-response.dto';

export class ActivityTemplateItemResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Toileting' })
  name: string;

  @ApiProperty({ example: 1 })
  sortOrder: number;
}

export class ActivityTemplateResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ type: ActivityTypeResponseDto })
  activityType: ActivityTypeResponseDto;

  @ApiProperty({ example: 'Bangun tidur' })
  name: string;

  @ApiProperty({ example: '04:45:00' })
  startTime: string;

  @ApiProperty({ example: '05:30:00' })
  endTime: string;

  @ApiProperty({ example: '04:45 - 05:30' })
  timeRange: string;

  @ApiProperty({ example: 0 })
  sortOrder: number;

  @ApiProperty({
    type: [ActivityTemplateItemResponseDto],
    description: 'Kegiatan',
  })
  items: ActivityTemplateItemResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ActivityTemplateFormGroupDto {
  @ApiProperty({ type: ActivityTypeResponseDto })
  activityType: ActivityTypeResponseDto;

  @ApiProperty({ type: [ActivityTemplateResponseDto] })
  slots: ActivityTemplateResponseDto[];
}

export class ActivityTemplateFormResponseDto {
  @ApiProperty({ type: [ActivityTemplateFormGroupDto] })
  groups: ActivityTemplateFormGroupDto[];
}
