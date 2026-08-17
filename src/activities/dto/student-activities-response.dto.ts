import { ApiProperty } from '@nestjs/swagger';
import { ActivityTypeResponseDto } from './activity-type-response.dto';
import { ActivityResponseDto, ActivityStudentDto } from './activity-response.dto';

export class ActivityGateDto {
  @ApiProperty({
    example: true,
    description: 'True when every active activity type exists for this date',
  })
  isComplete: boolean;

  @ApiProperty({ type: [ActivityTypeResponseDto] })
  completedTypes: ActivityTypeResponseDto[];

  @ApiProperty({ type: [ActivityTypeResponseDto] })
  missingTypes: ActivityTypeResponseDto[];
}

export class StudentActivityDayDto {
  @ApiProperty({ example: '2026-08-18' })
  date: string;

  @ApiProperty({ type: ActivityGateDto })
  gate: ActivityGateDto;

  @ApiProperty({ type: [ActivityResponseDto] })
  activities: ActivityResponseDto[];
}

export class StudentActivitiesResponseDto {
  @ApiProperty({ type: ActivityStudentDto })
  student: ActivityStudentDto;

  @ApiProperty({ type: [StudentActivityDayDto] })
  days: StudentActivityDayDto[];
}
