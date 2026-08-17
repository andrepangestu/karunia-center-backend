import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryStudentsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search by name or NIS' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: '7A',
    description: 'Filter by class / rombel',
  })
  @IsOptional()
  @IsString()
  class?: string;

  @ApiPropertyOptional({
    enum: ['name', 'nis', 'createdAt'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsIn(['name', 'nis', 'createdAt'])
  sortBy?: 'name' | 'nis' | 'createdAt';

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
}
