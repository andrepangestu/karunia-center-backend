import { ApiProperty } from '@nestjs/swagger';

export class ActivityTypeResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'PAGI' })
  code: string;

  @ApiProperty({ example: 'Pagi' })
  name: string;

  @ApiProperty({ example: 0 })
  sortOrder: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
