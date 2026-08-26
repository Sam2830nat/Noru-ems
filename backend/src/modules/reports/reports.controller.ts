import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { AttendanceReportDto } from './dto/report.dto';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'Dashboard metrics',
    description: 'Returns total/active employees, departments, roles, today\'s attendance rate, and per-department attendance breakdown for charts.',
  })
  getDashboard() {
    return this.service.getDashboardMetrics();
  }

  @Get('attendance')
  @ApiOperation({
    summary: 'Department Attendance Summary Report',
    description: `Non-trivial report using CTEs, generate_series date spine, and json_agg.
Returns per-department attendance stats with employee drill-down.
Ordered by worst attendance first — useful for daily hotel operations review.
Defaults to last 7 days if no dates provided.`,
  })
  getAttendanceSummary(@Query() dto: AttendanceReportDto) {
    return this.service.getAttendanceSummary(dto);
  }
}
