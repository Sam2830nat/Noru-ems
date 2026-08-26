// Shared TypeScript types matching the backend Prisma schema

export type EmployeeStatus = 'ACTIVE' | 'INACTIVE';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY';
export type UserRole = 'ADMIN' | 'MANAGER' | 'VIEWER';

export interface Department {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { employees: number };
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { employees: number };
}

export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  isOvernight: boolean;
  description: string | null;
  createdAt: string;
  _count?: { employees: number };
}

export interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  status: EmployeeStatus;
  hireDate: string;
  departmentId: string | null;
  roleId: string | null;
  department: { id: string; name: string } | null;
  role: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  id: string;
  employeeId: string;
  workDate: string;
  checkIn: string | null;
  checkOut: string | null;
  status: AttendanceStatus;
  notes: string | null;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    employeeNumber: string;
    department?: { id: string; name: string } | null;
    role?: { id: string; name: string } | null;
  };
  createdAt: string;
}

export interface EmployeeShift {
  id: string;
  employeeId: string;
  shiftId: string;
  assignedDate: string;
  shift: { id: string; name: string; startTime: string; endTime: string; isOvernight: boolean };
}

// ── API Response shapes ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: PaginationMeta | Record<string, unknown> | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiError {
  success: false;
  statusCode: number;
  message: string;
  errors: { field: string; message: string }[];
  timestamp: string;
  path: string;
}

// ── Report types ────────────────────────────────────────────────────────────

export interface EmployeeAttendanceStat {
  employeeId: string;
  employeeNumber: string;
  fullName: string;
  role: string | null;
  scheduledDays: number;
  daysPresent: number;
  daysAbsent: number;
  daysLate: number;
  daysHalfDay: number;
  attendancePct: number;
}

export interface DeptAttendanceSummary {
  departmentId: string | null;
  departmentName: string;
  totalEmployees: number;
  totalPresentDays: number;
  totalAbsentDays: number;
  totalLateDays: number;
  deptAttendancePct: number;
  employees: EmployeeAttendanceStat[];
}

export interface DashboardMetrics {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  totalDepartments: number;
  totalRoles: number;
  todayAttendance: {
    present: number;
    absent: number;
    late: number;
    attendanceRate: number;
  };
  departmentBreakdown: {
    department: string;
    present: number;
    absent: number;
    late: number;
  }[];
}

// ── Auth types ───────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}
