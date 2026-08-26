import {
  Injectable, NotFoundException, ConflictException, BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmployeeStatus } from '@prisma/client';
import {
  CreateEmployeeDto, UpdateEmployeeDto, EmployeeQueryDto, AssignShiftDto,
} from './dto/employee.dto';

const EMPLOYEE_INCLUDE = {
  department: { select: { id: true, name: true } },
  role: { select: { id: true, name: true } },
};

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: EmployeeQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { employeeNumber: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.departmentId) where.departmentId = query.departmentId;
    if (query.roleId) where.roleId = query.roleId;
    if (query.status) where.status = query.status;

    const [employees, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        include: EMPLOYEE_INCLUDE,
        orderBy: [{ status: 'asc' }, { firstName: 'asc' }],
        skip,
        take: limit,
      }),
      this.prisma.employee.count({ where }),
    ]);

    return {
      data: employees,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        ...EMPLOYEE_INCLUDE,
        shifts: {
          include: { shift: { select: { id: true, name: true, startTime: true, endTime: true, isOvernight: true } } },
          orderBy: { assignedDate: 'desc' },
          take: 10,
        },
        attendance: {
          orderBy: { workDate: 'desc' },
          take: 10,
        },
      },
    });
    if (!employee) throw new NotFoundException(`Employee with ID ${id} not found`);
    return { data: employee, meta: null };
  }

  async create(dto: CreateEmployeeDto) {
    // Validate department + role exist before creating
    if (dto.departmentId) {
      const dept = await this.prisma.department.findUnique({ where: { id: dto.departmentId } });
      if (!dept) throw new NotFoundException(`Department with ID ${dto.departmentId} not found`);
    }
    if (dto.roleId) {
      const role = await this.prisma.role.findUnique({ where: { id: dto.roleId } });
      if (!role) throw new NotFoundException(`Role with ID ${dto.roleId} not found`);
    }

    const emailExists = await this.prisma.employee.findUnique({ where: { email: dto.email } });
    if (emailExists) throw new ConflictException(`Email "${dto.email}" is already in use`);

    const employeeNumber = await this.generateEmployeeNumber();

    const employee = await this.prisma.employee.create({
      data: {
        ...dto,
        employeeNumber,
        hireDate: new Date(dto.hireDate),
      },
      include: EMPLOYEE_INCLUDE,
    });
    return { data: employee, meta: null };
  }

  async update(id: string, dto: UpdateEmployeeDto) {
    await this.findOne(id); // 404 guard

    if (dto.email) {
      const conflict = await this.prisma.employee.findFirst({
        where: { email: dto.email, NOT: { id } },
      });
      if (conflict) throw new ConflictException(`Email "${dto.email}" is already in use`);
    }
    if (dto.departmentId) {
      const dept = await this.prisma.department.findUnique({ where: { id: dto.departmentId } });
      if (!dept) throw new NotFoundException(`Department with ID ${dto.departmentId} not found`);
    }
    if (dto.roleId) {
      const role = await this.prisma.role.findUnique({ where: { id: dto.roleId } });
      if (!role) throw new NotFoundException(`Role with ID ${dto.roleId} not found`);
    }

    const updateData: any = { ...dto };
    if (dto.hireDate) updateData.hireDate = new Date(dto.hireDate);

    const employee = await this.prisma.employee.update({
      where: { id },
      data: updateData,
      include: EMPLOYEE_INCLUDE,
    });
    return { data: employee, meta: null };
  }

  /** Soft deactivation — never hard-deletes to preserve attendance history */
  async deactivate(id: string) {
    const { data: employee } = await this.findOne(id);

    if (employee.status === EmployeeStatus.INACTIVE) {
      throw new BadRequestException('Employee is already inactive');
    }

    const updated = await this.prisma.employee.update({
      where: { id },
      data: { status: EmployeeStatus.INACTIVE },
      include: EMPLOYEE_INCLUDE,
    });
    return { data: updated, meta: null };
  }

  // ── Shift Assignment ───────────────────────────────────────────────────────

  async assignShift(employeeId: string, dto: AssignShiftDto) {
    const { data: employee } = await this.findOne(employeeId);

    if (employee.status === EmployeeStatus.INACTIVE) {
      throw new BadRequestException('Cannot assign a shift to an inactive employee');
    }

    const shift = await this.prisma.shift.findUnique({ where: { id: dto.shiftId } });
    if (!shift) throw new NotFoundException(`Shift with ID ${dto.shiftId} not found`);

    const assignedDate = new Date(dto.assignedDate);

    // Business rule: one shift per employee per date
    const existing = await this.prisma.employeeShift.findUnique({
      where: { employeeId_assignedDate: { employeeId, assignedDate } },
      include: { shift: { select: { name: true } } },
    });
    if (existing) {
      throw new ConflictException(
        `Employee already has "${existing.shift.name}" shift assigned on ${dto.assignedDate}. Remove it first.`,
      );
    }

    const assignment = await this.prisma.employeeShift.create({
      data: { employeeId, shiftId: dto.shiftId, assignedDate },
      include: { shift: { select: { id: true, name: true, startTime: true, endTime: true } } },
    });
    return { data: assignment, meta: null };
  }

  async getShiftHistory(employeeId: string) {
    await this.findOne(employeeId); // 404 guard
    const assignments = await this.prisma.employeeShift.findMany({
      where: { employeeId },
      include: { shift: true },
      orderBy: { assignedDate: 'desc' },
    });
    return { data: assignments, meta: null };
  }

  // ── Auto-generate employee number ─────────────────────────────────────────

  private async generateEmployeeNumber(): Promise<string> {
    const last = await this.prisma.employee.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { employeeNumber: true },
    });
    if (!last) return 'EMP-001';
    const num = parseInt(last.employeeNumber.replace('EMP-', ''), 10);
    return `EMP-${String(num + 1).padStart(3, '0')}`;
  }
}
