import {
  IsString, IsOptional, MaxLength, Matches, IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateShiftDto {
  @ApiProperty({ example: 'Morning' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: '06:00', description: 'HH:MM 24-hour format' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'startTime must be in HH:MM format (e.g. 06:00)' })
  startTime: string;

  @ApiProperty({ example: '14:00', description: 'HH:MM 24-hour format' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'endTime must be in HH:MM format (e.g. 14:00)' })
  endTime: string;

  @ApiPropertyOptional({ example: true, description: 'Set true for overnight shifts e.g. 22:00–06:00' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isOvernight?: boolean;

  @ApiPropertyOptional({ example: 'Morning shift 6am–2pm' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class UpdateShiftDto extends PartialType(CreateShiftDto) {}
