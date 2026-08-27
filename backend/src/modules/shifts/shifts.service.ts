import {
  Injectable, NotFoundException, ConflictException, BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateShiftDto, UpdateShiftDto } from './dto/shift.dto';

@Injectable()
export class ShiftsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const shifts = await this.prisma.shift.findMany({
      include: { _count: { select: { employees: true } } },
      orderBy: { name: 'asc' },
    });
    return { data: shifts, meta: null };
  }

  async findOne(id: string) {
    const shift = await this.prisma.shift.findUnique({
      where: { id },
      include: { _count: { select: { employees: true } } },
    });
    if (!shift) throw new NotFoundException(`Shift with ID ${id} not found`);
    return { data: shift, meta: null };
  }

  async create(dto: CreateShiftDto) {
    const existing = await this.prisma.shift.findUnique({ where: { name: dto.name } });
    if (existing) throw new ConflictException(`Shift "${dto.name}" already exists`);

    // Auto-detect overnight if not explicitly provided
    const isOvernight = dto.isOvernight ?? this.detectOvernight(dto.startTime, dto.endTime);

    const shift = await this.prisma.shift.create({
      data: { ...dto, isOvernight },
    });
    return { data: shift, meta: null };
  }

  async update(id: string, dto: UpdateShiftDto) {
    const { data: existing } = await this.findOne(id);

    if (dto.name && dto.name !== existing.name) {
      const conflict = await this.prisma.shift.findFirst({
        where: { name: dto.name, NOT: { id } },
      });
      if (conflict) throw new ConflictException(`Shift "${dto.name}" already exists`);
    }

    // Recalculate isOvernight if times changed
    const startTime = dto.startTime ?? existing.startTime;
    const endTime = dto.endTime ?? existing.endTime;
    const isOvernight = dto.isOvernight ?? this.detectOvernight(startTime, endTime);

    const shift = await this.prisma.shift.update({
      where: { id },
      data: { ...dto, isOvernight },
    });
    return { data: shift, meta: null };
  }

  async remove(id: string) {
    const { data: shift } = await this.findOne(id);
    const count = shift._count?.employees || 0;
    await this.prisma.shift.delete({ where: { id } });
    return { 
      data: { 
        deleted: true, 
        message: count > 0 
          ? `Shift deleted successfully. ${count} shift assignment(s) were automatically removed.`
          : 'Shift deleted successfully.'
      }, 
      meta: null 
    };
  }

  /** If endTime < startTime (e.g. 22:00 → 06:00) the shift crosses midnight */
  private detectOvernight(startTime: string, endTime: string): boolean {
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    return sh * 60 + sm > eh * 60 + em;
  }
}
