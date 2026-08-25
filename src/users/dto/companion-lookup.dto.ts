import { ApiProperty } from '@nestjs/swagger';

export class CompanionLookupDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Siti Aminah' })
  name: string;
}
