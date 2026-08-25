import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { BehaviorCatalogItemDto } from './behavior-catalog-item.dto';

export class UpsertBehaviorCatalogItemDto extends BehaviorCatalogItemDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  id?: string;
}
