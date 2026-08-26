import {
  Injectable, NotFoundException, ConflictException, BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmployeeStatus } from '@prisma/client';
import { CreateAttendanceDto, UpdateAttendanceDto, AttendanceQueryDto } from './dto/attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: AttendanceQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.employeeId) where.employeeId = query.employeeId;
    if (query.status) where.status = query.status;
    if (query.startDate || query.endDate) {
      where.workDate = {};
      if (query.startDate) where.workDate.gte = new Date(query.startDate);
      if (query.endDate) where.workDate.lte = new Date(query.endDate);
    }

    const [records, total] = await Promise.all([
      this.prisma.attendance.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true, firstName: true, lastName: true, employeeNumber: true,
              department: { select: { id: true, name: true } },
              role: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: [{ workDate: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.attendance.count({ where }),
    ]);

    return {
      data: records,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const record = await this.prisma.attendance.findUnique({
      where: { id },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, employeeNumber: true } },
      },
    });
    if (!record) throw new NotFoundException(`Attendance record with ID ${id} not found`);
    return { data: record, meta: null };
  }

  async create(dto: CreateAttendanceDto) {
    // Rule 1: Employee must exist and be ACTIVE
    const employee = await this.prisma.employee.findUnique({ where: { id: dto.employeeId } });
    if (!employee) throw new NotFoundException(`Employee with ID ${dto.employeeId} not found`);
    if (employee.status === EmployeeStatus.INACTIVE) {
      throw new BadRequestException('Cannot record attendance for an inactive employee');
    }

    const workDate = new Date(dto.workDate);

    // Rule 2: Only one record per employee per work date
    const existing = await this.prisma.attendance.findUnique({
      where: { employeeId_workDate: { employeeId: dto.employeeId, workDate } },
    });
    if (existing) {
      throw new ConflictException(
        `Attendance record already exists for employee ${employee.employeeNumber} on ${dto.workDate}`,
      );
    }

    // Rule 3: checkIn must be before checkOut
    if (dto.checkIn && dto.checkOut) {
      const checkIn = new Date(dto.checkIn);
      const checkOut = new Date(dto.checkOut);
      if (checkIn >= checkOut) {
        throw new BadRequestException('checkIn time must be before checkOut time');
      }
    }

    const record = await this.prisma.attendance.create({
      data: {
        employeeId: dto.employeeId,
        workDate,
        checkIn: dto.checkIn ? new Date(dto.checkIn) : null,
        checkOut: dto.checkOut ? new Date(dto.checkOut) : null,
        status: dto.status,
        notes: dto.notes,
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, employeeNumber: true } },
      },
    });
    return { data: record, meta: null };
  }

  async update(id: string, dto: UpdateAttendanceDto) {
    const { data: existing } = await this.findOne(id);

    // Re-validate checkIn/checkOut if either is updated
    const checkIn = dto.checkIn ? new Date(dto.checkIn) : existing.checkIn;
    const checkOut = dto.checkOut ? new Date(dto.checkOut) : existing.checkOut;

    if (checkIn && checkOut && checkIn >= checkOut) {
      throw new BadRequestException('checkIn time must be before checkOut time');
    }

    const record = await this.prisma.attendance.update({
      where: { id },
      data: {
        ...(dto.checkIn && { checkIn: new Date(dto.checkIn) }),
        ...(dto.checkOut && { checkOut: new Date(dto.checkOut) }),
        ...(dto.status && { status: dto.status }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, employeeNumber: true } },
      },
    });
    return { data: record, meta: null };
  }
}
