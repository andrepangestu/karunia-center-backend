import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { ActivityItemValue } from '../../common/enums/activity-item-value.enum';

export class SubmitActivityItemDto {
  @ApiPropertyOptional({
    format: 'uuid',
    description:
      'Kegiatan from the daily catalog. Name is copied from the template.',
  })
  @IsOptional()
  @IsUUID()
  templateItemId?: string;

  @ApiPropertyOptional({
    example: 'Sholat Shubuh',
    description: 'Required when templateItemId is omitted (one-off kegiatan).',
  })
  @ValidateIf((item: SubmitActivityItemDto) => !item.templateItemId)
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name?: string;

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
