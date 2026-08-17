import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({ example: 'Ahmad Fauzi', maxLength: 150 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @ApiProperty({ example: '2026001', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nis: string;

  @ApiProperty({
    example: '7A',
    maxLength: 50,
    description: 'Class / rombel',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  class: string;

  @ApiPropertyOptional({ example: 'Jl. Melati No. 5' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
