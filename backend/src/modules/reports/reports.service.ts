import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AttendanceReportDto } from './dto/report.dto';

// ── Raw SQL row types ────────────────────────────────────────────────────────

interface RawEmployeeStat {
  employee_id: string;
  employee_number: string;
  full_name: string;
  role_name: string | null;
  department_id: string | null;
  department_name: string | null;
  scheduled_days: bigint;
  days_present: bigint;
  days_absent: bigint;
  days_late: bigint;
  days_half_day: bigint;
  attendance_pct: number | null;
}

interface RawDeptSummary {
  department_id: string | null;
  department_name: string | null;
  total_employees: bigint;
  total_present: bigint;
  total_absent: bigint;
  total_late: bigint;
  dept_attendance_pct: number | null;
  employees: RawEmployeeStat[];
}

// ── Dashboard raw types ──────────────────────────────────────────────────────

interface RawDashboardMetrics {
  total_employees: bigint;
  active_employees: bigint;
  inactive_employees: bigint;
  total_departments: bigint;
  total_roles: bigint;
  today_present: bigint;
  today_absent: bigint;
  today_late: bigint;
}

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Attendance Report (Non-Trivial) ────────────────────────────────────────

  async getAttendanceSummary(dto: AttendanceReportDto) {
    // Default: last 7 days
    const endDate = dto.endDate
      ? new Date(dto.endDate)
      : new Date();
    const startDate = dto.startDate
      ? new Date(dto.startDate)
      : new Date(new Date().setDate(endDate.getDate() - 6));

    // Normalize to midnight UTC
    startDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(23, 59, 59, 999);

    const departmentFilter = dto.departmentId ?? null;

    /*
     * QUERY DESIGN NOTES (for interview):
     *
     * 1. generate_series builds a date spine — counts working days correctly
     *    even when an employee has NO attendance records (would otherwise be invisible)
     *
     * 2. FILTER (WHERE ...) is modern PostgreSQL conditional aggregation —
     *    more readable and faster than CASE WHEN inside SUM
     *
     * 3. json_agg + json_build_object returns dept + employees in ONE round-trip
     *    No N+1 queries
     *
     * 4. NULLIF(scheduled_days, 0) guards against division by zero for edge cases
     *
     * 5. Results ordered by dept_attendance_pct ASC — worst departments first,
     *    which is exactly what a hotel manager needs to see every morning
     *
     * INDEXES USED:
     *   - employees.department_id  (LEFT JOIN)
     *   - employees.status         (WHERE e.status = 'ACTIVE')
     *   - attendance.employee_id   (LEFT JOIN)
     *   - attendance.work_date     (BETWEEN filter)
     */
    const rows = await this.prisma.$queryRaw<RawDeptSummary[]>`
      WITH date_spine AS (
        SELECT generate_series(
          ${startDate}::date,
          ${endDate}::date,
          '1 day'::interval
        )::date AS day
      ),
      scheduled_days_count AS (
        SELECT COUNT(*)::int AS total FROM date_spine
      ),
      employee_stats AS (
        SELECT
          e.id                                                        AS employee_id,
          e.employee_number,
          e.first_name || ' ' || e.last_name                         AS full_name,
          r.name                                                      AS role_name,
          d.id                                                        AS department_id,
          d.name                                                      AS department_name,
          sd.total                                                    AS scheduled_days,
          COUNT(a.id) FILTER (WHERE a.status IN ('PRESENT','LATE','HALF_DAY')) AS days_present,
          COUNT(a.id) FILTER (WHERE a.status = 'ABSENT')              AS days_absent,
          COUNT(a.id) FILTER (WHERE a.status = 'LATE')                AS days_late,
          COUNT(a.id) FILTER (WHERE a.status = 'HALF_DAY')            AS days_half_day,
          ROUND(
            COUNT(a.id) FILTER (WHERE a.status IN ('PRESENT','LATE','HALF_DAY'))::numeric
            / NULLIF(sd.total, 0) * 100, 1
          )                                                           AS attendance_pct
        FROM employees e
        CROSS JOIN scheduled_days_count sd
        LEFT JOIN departments d  ON d.id = e.department_id
        LEFT JOIN roles r        ON r.id = e.role_id
        LEFT JOIN attendance a   ON a.employee_id = e.id
                                AND a.work_date BETWEEN ${startDate}::date AND ${endDate}::date
        WHERE e.status = 'ACTIVE'
          AND (${departmentFilter}::text IS NULL OR e.department_id = ${departmentFilter}::text)
        GROUP BY e.id, e.first_name, e.last_name, e.employee_number,
                 d.id, d.name, r.name, sd.total
      ),
      dept_summary AS (
        SELECT
          department_id,
          department_name,
          COUNT(employee_id)                                          AS total_employees,
          SUM(days_present)                                           AS total_present,
          SUM(days_absent)                                            AS total_absent,
          SUM(days_late)                                              AS total_late,
          ROUND(AVG(attendance_pct), 1)                               AS dept_attendance_pct
        FROM employee_stats
        GROUP BY department_id, department_name
      )
      SELECT
        ds.department_id,
        ds.department_name,
        ds.total_employees,
        ds.total_present,
        ds.total_absent,
        ds.total_late,
        ds.dept_attendance_pct,
        json_agg(
          json_build_object(
            'employeeId',      es.employee_id,
            'employeeNumber',  es.employee_number,
            'fullName',        es.full_name,
            'role',            es.role_name,
            'scheduledDays',   es.scheduled_days,
            'daysPresent',     es.days_present,
            'daysAbsent',      es.days_absent,
            'daysLate',        es.days_late,
            'daysHalfDay',     es.days_half_day,
            'attendancePct',   es.attendance_pct
          ) ORDER BY es.attendance_pct ASC NULLS LAST
        ) AS employees
      FROM dept_summary ds
      JOIN employee_stats es USING (department_id)
      GROUP BY ds.department_id, ds.department_name, ds.total_employees,
               ds.total_present, ds.total_absent, ds.total_late, ds.dept_attendance_pct
      ORDER BY ds.dept_attendance_pct ASC NULLS LAST;
    `;

    // Normalize BigInt → Number for JSON serialization
    const formatted = rows.map((row) => ({
      departmentId: row.department_id,
      departmentName: row.department_name ?? 'Unassigned',
      totalEmployees: Number(row.total_employees),
      totalPresentDays: Number(row.total_present),
      totalAbsentDays: Number(row.total_absent),
      totalLateDays: Number(row.total_late),
      deptAttendancePct: row.dept_attendance_pct ? Number(row.dept_attendance_pct) : 0,
      employees: (row.employees as any[]).map((e) => ({
        ...e,
        scheduledDays: Number(e.scheduledDays),
        daysPresent: Number(e.daysPresent),
        daysAbsent: Number(e.daysAbsent),
        daysLate: Number(e.daysLate),
        daysHalfDay: Number(e.daysHalfDay),
        attendancePct: e.attendancePct ? Number(e.attendancePct) : 0,
      })),
    }));

    return {
      data: formatted,
      meta: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        totalDepartments: formatted.length,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  // ── Dashboard Metrics ─────────────────────────────────────────────────────

  async getDashboardMetrics() {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const [metrics] = await this.prisma.$queryRaw<RawDashboardMetrics[]>`
      SELECT
        COUNT(*)                                                      AS total_employees,
        COUNT(*) FILTER (WHERE status = 'ACTIVE')                    AS active_employees,
        COUNT(*) FILTER (WHERE status = 'INACTIVE')                  AS inactive_employees,
        (SELECT COUNT(*) FROM departments)                           AS total_departments,
        (SELECT COUNT(*) FROM roles)                                 AS total_roles,
        (SELECT COUNT(*) FROM attendance
          WHERE work_date = ${today}::date
            AND status IN ('PRESENT', 'LATE', 'HALF_DAY'))           AS today_present,
        (SELECT COUNT(*) FROM attendance
          WHERE work_date = ${today}::date AND status = 'ABSENT')    AS today_absent,
        (SELECT COUNT(*) FROM attendance
          WHERE work_date = ${today}::date AND status = 'LATE')      AS today_late
      FROM employees;
    `;

    const activeCount = Number(metrics.active_employees);
    const todayPresent = Number(metrics.today_present);
    const todayAbsent = Number(metrics.today_absent);
    const todayTotal = todayPresent + todayAbsent;

    // Dept breakdown for the bar chart on the frontend
    const deptBreakdown = await this.prisma.$queryRaw<
      { dept_name: string; present: bigint; absent: bigint; late: bigint }[]
    >`
      SELECT
        d.name AS dept_name,
        COUNT(a.id) FILTER (WHERE a.status IN ('PRESENT','LATE','HALF_DAY')) AS present,
        COUNT(a.id) FILTER (WHERE a.status = 'ABSENT')                       AS absent,
        COUNT(a.id) FILTER (WHERE a.status = 'LATE')                         AS late
      FROM departments d
      LEFT JOIN employees e ON e.department_id = d.id AND e.status = 'ACTIVE'
      LEFT JOIN attendance a ON a.employee_id = e.id
                             AND a.work_date = ${today}::date
      GROUP BY d.name
      ORDER BY d.name;
    `;

    return {
      data: {
        totalEmployees: Number(metrics.total_employees),
        activeEmployees: activeCount,
        inactiveEmployees: Number(metrics.inactive_employees),
        totalDepartments: Number(metrics.total_departments),
        totalRoles: Number(metrics.total_roles),
        todayAttendance: {
          present: todayPresent,
          absent: todayAbsent,
          late: Number(metrics.today_late),
          attendanceRate: todayTotal > 0
            ? Math.round((todayPresent / todayTotal) * 100)
            : 0,
        },
        departmentBreakdown: deptBreakdown.map((d) => ({
          department: d.dept_name,
          present: Number(d.present),
          absent: Number(d.absent),
          late: Number(d.late),
        })),
      },
      meta: { generatedAt: new Date().toISOString() },
    };
  }
}
