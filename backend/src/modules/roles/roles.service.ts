import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const roles = await this.prisma.role.findMany({
      include: { _count: { select: { employees: true } } },
      orderBy: { name: 'asc' },
    });
    return { data: roles, meta: null };
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { employees: true } } },
    });
    if (!role) throw new NotFoundException(`Role with ID ${id} not found`);
    return { data: role, meta: null };
  }

  async create(dto: CreateRoleDto) {
    const existing = await this.prisma.role.findUnique({ where: { name: dto.name } });
    if (existing) throw new ConflictException(`Role "${dto.name}" already exists`);

    const role = await this.prisma.role.create({ data: dto });
    return { data: role, meta: null };
  }

  async update(id: string, dto: UpdateRoleDto) {
    await this.findOne(id);

    if (dto.name) {
      const conflict = await this.prisma.role.findFirst({
        where: { name: dto.name, NOT: { id } },
      });
      if (conflict) throw new ConflictException(`Role "${dto.name}" already exists`);
    }

    const role = await this.prisma.role.update({ where: { id }, data: dto });
    return { data: role, meta: null };
  }

  async remove(id: string) {
    await this.findOne(id);
    const employeeCount = await this.prisma.employee.count({ where: { roleId: id } });
    await this.prisma.role.delete({ where: { id } });
    return {
      data: {
        deleted: true,
        message: employeeCount > 0
          ? `Role deleted. ${employeeCount} employee(s) were unassigned from this role.`
          : 'Role deleted successfully.',
      },
      meta: null,
    };
  }
}
