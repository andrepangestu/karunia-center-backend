import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { BehaviorCatalogItemDto } from './behavior-catalog-item.dto';

export class CreateBehaviorCategoryDto {
  @ApiProperty({
    example: 'TANTRUM',
    description:
      'Unique code. Letters, numbers, and underscore. Stored uppercase.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(/^[A-Za-z][A-Za-z0-9_]*$/, {
    message:
      'code must start with a letter and contain only letters, numbers, or underscore',
  })
  code: string;

  @ApiProperty({ example: 'Perilaku Tantrum' })
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

  @ApiPropertyOptional({
    type: [BehaviorCatalogItemDto],
    description: 'Checklist items under this category',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BehaviorCatalogItemDto)
  items?: BehaviorCatalogItemDto[];
}
