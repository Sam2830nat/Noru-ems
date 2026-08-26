import {
  IsString, IsOptional, IsEnum, IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { AttendanceStatus } from '@prisma/client';

export class CreateAttendanceDto {
  @ApiProperty({ example: 'clx_employee_id' })
  @IsString()
  employeeId: string;

  @ApiProperty({ example: '2026-08-26', description: 'YYYY-MM-DD' })
  @IsDateString({}, { message: 'workDate must be a valid date (YYYY-MM-DD)' })
  workDate: string;

  @ApiPropertyOptional({ example: '2026-08-26T08:00:00.000Z' })
  @IsOptional()
  @IsDateString({}, { message: 'checkIn must be a valid ISO datetime' })
  checkIn?: string;

  @ApiPropertyOptional({ example: '2026-08-26T16:00:00.000Z' })
  @IsOptional()
  @IsDateString({}, { message: 'checkOut must be a valid ISO datetime' })
  checkOut?: string;

  @ApiPropertyOptional({ enum: AttendanceStatus, default: AttendanceStatus.PRESENT })
  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;

  @ApiPropertyOptional({ example: 'Arrived late due to traffic' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateAttendanceDto extends PartialType(CreateAttendanceDto) {}

export class AttendanceQueryDto {
  @ApiPropertyOptional() @IsOptional() page?: number = 1;
  @ApiPropertyOptional() @IsOptional() limit?: number = 20;

  @ApiPropertyOptional({ example: 'clx_employee_id' })
  @IsOptional() @IsString()
  employeeId?: string;

  @ApiPropertyOptional({ example: '2026-08-20' })
  @IsOptional() @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-08-26' })
  @IsOptional() @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ enum: AttendanceStatus })
  @IsOptional() @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;
}
