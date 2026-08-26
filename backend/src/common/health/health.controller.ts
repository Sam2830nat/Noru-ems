import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { Public } from '../../modules/auth/decorators/public.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Health check — confirms API and DB are reachable' })
  async check() {
    await this.prisma.$queryRaw`SELECT 1`;
    return {
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected',
      },
      meta: null,
    };
  }
}
