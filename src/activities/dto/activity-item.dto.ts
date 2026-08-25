import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ActivityItemValue } from '../../common/enums/activity-item-value.enum';

export class ActivityItemDto {
  @ApiProperty({ example: 'Sholat Subuh berjamaah' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @ApiProperty({
    enum: ActivityItemValue,
    enumName: 'ActivityItemValue',
    example: ActivityItemValue.P,
  })
  @IsEnum(ActivityItemValue)
  value: ActivityItemValue;

  @ApiPropertyOptional({
    example: 'Masih perlu bantuan saat berwudhu',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  note?: string | null;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @Type(() => Number)
  sortOrder?: number;
}
