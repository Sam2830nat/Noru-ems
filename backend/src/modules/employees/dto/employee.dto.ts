import {
  IsString, IsEmail, IsOptional, IsEnum, IsDateString,
  MaxLength, MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { EmployeeStatus } from '@prisma/client';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'Sara' })
  @IsString()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Tesfaye' })
  @IsString()
  @MaxLength(100)
  lastName: string;

  @ApiProperty({ example: 'sara.tesfaye@norubooking.com' })
  @IsEmail({}, { message: 'email must be a valid email address' })
  email: string;

  @ApiPropertyOptional({ example: '+251911000001' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({ example: '2023-01-15', description: 'ISO date string YYYY-MM-DD' })
  @IsDateString({}, { message: 'hireDate must be a valid date (YYYY-MM-DD)' })
  hireDate: string;

  @ApiPropertyOptional({ example: 'clx_dept_id' })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional({ example: 'clx_role_id' })
  @IsOptional()
  @IsString()
  roleId?: string;
}

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {
  @ApiPropertyOptional({ enum: EmployeeStatus })
  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;
}

export class EmployeeQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional({ example: 'Sara' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'clx_dept_id' })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional({ example: 'clx_role_id' })
  @IsOptional()
  @IsString()
  roleId?: string;

  @ApiPropertyOptional({ enum: EmployeeStatus })
  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;
}

export class AssignShiftDto {
  @ApiProperty({ example: 'clx_shift_id' })
  @IsString()
  shiftId: string;

  @ApiProperty({ example: '2026-08-26', description: 'YYYY-MM-DD' })
  @IsDateString({}, { message: 'assignedDate must be a valid date (YYYY-MM-DD)' })
  assignedDate: string;
}
