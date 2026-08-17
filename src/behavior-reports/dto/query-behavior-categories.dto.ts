import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryBehaviorCategoriesDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search by code or name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @Transform(({ value }): boolean | undefined => {
    if (value === 'true' || value === true) {
      return true;
    }
    if (value === 'false' || value === false) {
      return false;
    }
    return undefined;
  })
  @IsBoolean()
  isActive?: boolean;
}
