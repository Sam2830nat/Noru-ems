import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── API prefix ──────────────────────────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ── CORS ────────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  // ── Validation ──────────────────────────────────────────────────────────────
  // whitelist: strips unknown fields from DTOs (prevents mass-assignment attacks)
  // transform: auto-coerces plain JS objects into DTO class instances
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // ── Swagger / OpenAPI ───────────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('Noru Hotel EMS API')
    .setDescription(
      'Hotel Employee Management System — REST API for managing employees, departments, roles, shifts, attendance, and reports.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Employees', 'Employee management')
    .addTag('Departments', 'Department management')
    .addTag('Roles', 'Role catalogue')
    .addTag('Shifts', 'Shift definitions and assignments')
    .addTag('Attendance', 'Attendance recording and history')
    .addTag('Reports', 'Analytical reports')
    .addTag('Health', 'System health check')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  // ── Listen ──────────────────────────────────────────────────────────────────
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Noru EMS API running at http://localhost:${port}/api/v1`);
  console.log(`📖 Swagger docs at   http://localhost:${port}/api/docs`);
}

bootstrap();
