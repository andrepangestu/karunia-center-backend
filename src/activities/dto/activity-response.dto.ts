import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../common/enums/user-role.enum';
import { ActivityType } from '../../common/enums/activity-type.enum';
import { ActivityItemValue } from '../../common/enums/activity-item-value.enum';

export class ActivityCompanionDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: UserRole, enumName: 'UserRole' })
  role: UserRole;
}

export class ActivityStudentDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ example: '2026001' })
  nis: string;

  @ApiProperty({ example: '7A' })
  class: string;
}

export class ActivityItemResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: ActivityItemValue, enumName: 'ActivityItemValue' })
  value: ActivityItemValue;

  @ApiProperty()
  sortOrder: number;
}

export class ActivityMaterialResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ example: '08:00:00' })
  startTime: string;

  @ApiProperty({ example: '09:00:00' })
  endTime: string;

  @ApiProperty({ example: '08:00 - 09:00' })
  timeRange: string;

  @ApiProperty()
  sortOrder: number;
}

export class ActivityResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ enum: ActivityType, enumName: 'ActivityType' })
  activityType: ActivityType;

  @ApiProperty({ example: '2026-08-17' })
  activityDate: string;

  @ApiProperty({ type: ActivityCompanionDto })
  companion: ActivityCompanionDto;

  @ApiProperty({ type: ActivityStudentDto })
  student: ActivityStudentDto;

  @ApiPropertyOptional({ nullable: true })
  description: string | null;

  @ApiPropertyOptional({
    type: [ActivityItemResponseDto],
    description: 'Kegiatan',
  })
  items?: ActivityItemResponseDto[];

  @ApiPropertyOptional({
    type: [ActivityMaterialResponseDto],
    description: 'Materi',
  })
  materials?: ActivityMaterialResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
