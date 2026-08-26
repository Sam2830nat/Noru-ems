import { IsOptional, IsDateString, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AttendanceReportDto {
  @ApiPropertyOptional({ example: '2026-08-19', description: 'Start date YYYY-MM-DD (defaults to 7 days ago)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-08-26', description: 'End date YYYY-MM-DD (defaults to today)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 'clx_dept_id', description: 'Filter by department ID' })
  @IsOptional()
  @IsString()
  departmentId?: string;
}
