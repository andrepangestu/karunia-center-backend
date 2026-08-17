import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, Matches } from 'class-validator';
import { DATE_PATTERN } from '../utils/time.util';

export class QueryStudentActivitiesDto {
  @ApiPropertyOptional({
    example: '2026-08-18',
    description: 'Single day. Defaults to today (Asia/Jakarta) when no date filter is given.',
  })
  @IsOptional()
  @Matches(DATE_PATTERN, { message: 'date must be YYYY-MM-DD' })
  date?: string;

  @ApiPropertyOptional({ example: '2026-08-01' })
  @IsOptional()
  @Matches(DATE_PATTERN, { message: 'dateFrom must be YYYY-MM-DD' })
  dateFrom?: string;

  @ApiPropertyOptional({ example: '2026-08-31' })
  @IsOptional()
  @Matches(DATE_PATTERN, { message: 'dateTo must be YYYY-MM-DD' })
  dateTo?: string;
}
