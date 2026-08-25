import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { TIME_PATTERN } from '../utils/time.util';

export class ActivityMaterialDto {
  @ApiProperty({ example: '08:00', description: 'HH:mm or HH:mm:ss' })
  @IsString()
  @Matches(TIME_PATTERN, { message: 'startTime must be HH:mm or HH:mm:ss' })
  startTime: string;

  @ApiProperty({ example: '09:00', description: 'HH:mm or HH:mm:ss' })
  @IsString()
  @Matches(TIME_PATTERN, { message: 'endTime must be HH:mm or HH:mm:ss' })
  endTime: string;

  @ApiProperty({ example: 'Matematika' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @Type(() => Number)
  sortOrder?: number;
}
