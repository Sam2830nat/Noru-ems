import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ShiftsService } from './shifts.service';
import { CreateShiftDto, UpdateShiftDto } from './dto/shift.dto';

@ApiTags('Shifts')
@ApiBearerAuth()
@Controller('shifts')
export class ShiftsController {
  constructor(private readonly service: ShiftsService) {}

  @Get()
  @ApiOperation({ summary: 'List all shifts' })
  findAll() { return this.service.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single shift' })
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @ApiOperation({ summary: 'Create a shift (overnight auto-detected if endTime < startTime)' })
  create(@Body() dto: CreateShiftDto) { return this.service.create(dto); }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a shift' })
  update(@Param('id') id: string, @Body() dto: UpdateShiftDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a shift' })
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
