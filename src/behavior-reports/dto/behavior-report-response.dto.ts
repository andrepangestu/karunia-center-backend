import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BehaviorScore } from '../../common/enums/behavior-score.enum';

export class BehaviorReportResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  activityId: string;

  @ApiProperty({ example: 'Perilaku Tantrum' })
  behaviorType: string;

  @ApiProperty({ example: 'Menjerit' })
  behaviorName: string;

  @ApiProperty({ enum: BehaviorScore, enumName: 'BehaviorScore', example: 1 })
  score: BehaviorScore;

  @ApiPropertyOptional({ nullable: true })
  description: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
