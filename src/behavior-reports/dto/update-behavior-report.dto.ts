import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BehaviorScore } from '../../common/enums/behavior-score.enum';

export class UpdateBehaviorReportDto {
  @ApiPropertyOptional({
    enum: BehaviorScore,
    enumName: 'BehaviorScore',
    example: BehaviorScore.TWO,
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(BehaviorScore)
  score?: BehaviorScore;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
