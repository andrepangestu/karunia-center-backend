import { ApiProperty } from '@nestjs/swagger';

export class BehaviorCatalogItemResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Menjerit' })
  name: string;

  @ApiProperty({ example: 0 })
  sortOrder: number;
}

export class BehaviorCategoryResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'TANTRUM' })
  code: string;

  @ApiProperty({ example: 'Perilaku Tantrum' })
  name: string;

  @ApiProperty({ example: 0 })
  sortOrder: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ type: [BehaviorCatalogItemResponseDto] })
  items: BehaviorCatalogItemResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class BehaviorCategoryFormResponseDto {
  @ApiProperty({ type: [BehaviorCategoryResponseDto] })
  groups: BehaviorCategoryResponseDto[];
}
