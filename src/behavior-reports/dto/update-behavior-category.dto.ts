import { ApiPropertyOptional } from '@nestjs/swagger';
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
import { UpsertBehaviorCatalogItemDto } from './upsert-behavior-catalog-item.dto';

export class UpdateBehaviorCategoryDto {
  @ApiPropertyOptional({ example: 'TANTRUM' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(/^[A-Za-z][A-Za-z0-9_]*$/, {
    message:
      'code must start with a letter and contain only letters, numbers, or underscore',
  })
  code?: string;

  @ApiPropertyOptional({ example: 'Perilaku Tantrum' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  sortOrder?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    type: [UpsertBehaviorCatalogItemDto],
    description: 'Replace-set items. Omitted = keep existing. [] = remove all.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertBehaviorCatalogItemDto)
  items?: UpsertBehaviorCatalogItemDto[];
}
