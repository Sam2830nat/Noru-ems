import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import {
  CreateEmployeeDto, UpdateEmployeeDto, EmployeeQueryDto, AssignShiftDto,
} from './dto/employee.dto';

@ApiTags('Employees')
@ApiBearerAuth()
@Controller('employees')
export class EmployeesController {
  constructor(private readonly service: EmployeesService) {}

  @Get()
  @ApiOperation({ summary: 'List employees — paginated, searchable, filterable' })
  findAll(@Query() query: EmployeeQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee detail with recent shifts and attendance' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create employee (employee number auto-generated)' })
  create(@Body() dto: CreateEmployeeDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update employee details or status' })
  update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Permanently delete employee' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  // ── Shift Assignment ───────────────────────────────────────────────────────

  @Post(':id/shifts')
  @ApiOperation({ summary: 'Assign a shift to an employee on a specific date' })
  assignShift(@Param('id') id: string, @Body() dto: AssignShiftDto) {
    return this.service.assignShift(id, dto);
  }

  @Get(':id/shifts')
  @ApiOperation({ summary: 'Get shift history for an employee' })
  getShiftHistory(@Param('id') id: string) {
    return this.service.getShiftHistory(id);
  }
}
