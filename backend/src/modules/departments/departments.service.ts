import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const departments = await this.prisma.department.findMany({
      include: { _count: { select: { employees: true } } },
      orderBy: { name: 'asc' },
    });
    return { data: departments, meta: null };
  }

  async findOne(id: string) {
    const dept = await this.prisma.department.findUnique({
      where: { id },
      include: { _count: { select: { employees: true } } },
    });
    if (!dept) throw new NotFoundException(`Department with ID ${id} not found`);
    return { data: dept, meta: null };
  }

  async create(dto: CreateDepartmentDto) {
    const existing = await this.prisma.department.findUnique({ where: { name: dto.name } });
    if (existing) throw new ConflictException(`Department "${dto.name}" already exists`);

    const dept = await this.prisma.department.create({ data: dto });
    return { data: dept, meta: null };
  }

  async update(id: string, dto: UpdateDepartmentDto) {
    await this.findOne(id); // throws 404 if not found

    if (dto.name) {
      const conflict = await this.prisma.department.findFirst({
        where: { name: dto.name, NOT: { id } },
      });
      if (conflict) throw new ConflictException(`Department "${dto.name}" already exists`);
    }

    const dept = await this.prisma.department.update({ where: { id }, data: dto });
    return { data: dept, meta: null };
  }

  async remove(id: string) {
    const { data: dept } = await this.findOne(id);
    const employeeCount = await this.prisma.employee.count({ where: { departmentId: id } });

    // Warn but still allow — Prisma will SET NULL on employees (schema onDelete: SetNull)
    await this.prisma.department.delete({ where: { id } });
    return {
      data: {
        deleted: true,
        message: employeeCount > 0
          ? `Department deleted. ${employeeCount} employee(s) were unassigned from this department.`
          : 'Department deleted successfully.',
      },
      meta: null,
    };
  }
}
