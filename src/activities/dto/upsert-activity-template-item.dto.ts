import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { ActivityTemplateItemDto } from './activity-template-item.dto';

export class UpsertActivityTemplateItemDto extends ActivityTemplateItemDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  id?: string;
}
