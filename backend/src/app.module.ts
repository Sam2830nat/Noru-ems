import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { RolesModule } from './modules/roles/roles.module';
import { ShiftsModule } from './modules/shifts/shifts.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { ReportsModule } from './modules/reports/reports.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { HealthController } from './common/health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    DepartmentsModule,
    RolesModule,
    ShiftsModule,
    EmployeesModule,
    AttendanceModule,
    ReportsModule,
  ],
  controllers: [HealthController],
  providers: [
    // Global JWT guard — all routes require auth unless decorated with @Public()
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // Wrap every success response in { success, data, meta }
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    // Normalize all errors into consistent JSON envelope
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
