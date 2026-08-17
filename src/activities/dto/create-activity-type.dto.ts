import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateActivityTypeDto {
  @ApiProperty({
    example: 'PAGI',
    description: 'Unique code. Letters, numbers, and underscore. Stored uppercase.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(/^[A-Za-z][A-Za-z0-9_]*$/, {
    message: 'code must start with a letter and contain only letters, numbers, or underscore',
  })
  code: string;

  @ApiProperty({ example: 'Pagi' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  sortOrder?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
