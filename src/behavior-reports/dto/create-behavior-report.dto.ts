import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { BehaviorScore } from '../../common/enums/behavior-score.enum';

export class CreateBehaviorReportDto {
  @ApiProperty({
    format: 'uuid',
    description: 'Item from the behavior catalog. Type and name are copied.',
  })
  @IsUUID()
  catalogItemId: string;

  @ApiProperty({
    enum: BehaviorScore,
    enumName: 'BehaviorScore',
    example: BehaviorScore.ONE,
  })
  @Type(() => Number)
  @IsEnum(BehaviorScore)
  score: BehaviorScore;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
