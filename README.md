# Noru Hotel Employee Management System

A production-ready, full-stack Employee Management System built as a technical challenge for Noru Booking. It demonstrates senior-level engineering judgment, modular monolith architecture, robust relational data modeling, and a highly polished UI.

## 🚀 Quick Start

The entire application is containerized. You only need Docker installed.

```bash
# 1. Start the database, run migrations, seed data, and start the backend & frontend
docker-compose up --build
```

**Access Points:**
- **Frontend App:** [http://localhost:3000](http://localhost:3000)
- **API Swagger Docs:** [http://localhost:3001/api/docs](http://localhost:3001/api/docs)

**Demo Credentials:**
- Email: `admin@norubooking.com`
- Password: `admin123`

*(The seed script automatically populates the database with 10 hotel employees, departments, roles, shifts, and 7 days of historical attendance data).*

---

## 🏗 Architecture: Modular Monolith

**Backend:** NestJS (TypeScript, strict mode) + Prisma ORM + PostgreSQL
**Frontend:** Next.js 14 (App Router) + Tailwind CSS v4 + Recharts

**Why a modular monolith?**
Microservices introduce distributed systems complexity (network latency, distributed transactions, independent deployments) that provides zero benefit at this scale. A modular monolith gives us the same domain isolation through strict module boundaries (Employees, Departments, Roles, Shifts, Attendance, Reports). It ships faster, is easier to maintain, and allows future extraction of specific modules (e.g., Attendance becomes its own microservice) only when load or team size justifies it.

---

## 🗄 Relational Database Design

The schema is built for a real hotel environment:

1. **`employee_shifts` Junction Table**
   - A static `shift_id` on the `employees` table assumes someone always works the exact same shift forever. In reality, a receptionist works Morning on Monday and Night on Friday. The `employee_shifts` junction table models reality with an `assigned_date` column.
2. **Soft Deactivation (`status: 'INACTIVE'`)**
   - When an employee leaves, we never `DELETE` their record. Doing so would either cascade and delete their historical attendance (destroying payroll/reporting) or leave orphaned records. Instead, we use soft deactivation.
3. **Database Constraints**
   - Unique constraints on `(employee_id, assigned_date)` prevent double-booking an employee.
   - Unique constraints on `(employee_id, work_date)` prevent double-recording attendance.

---

## 📊 Non-Trivial Reporting

The `GET /api/v1/reports/attendance` endpoint generates a daily Department Attendance Summary. 

**SQL Implementation Details:**
- **`generate_series()`**: Builds a date spine so we can correctly count total working days, ensuring employees with *zero* attendance records aren't invisible in the report.
- **`FILTER (WHERE ...)`**: Uses modern PostgreSQL conditional aggregation instead of bulky `CASE WHEN` statements.
- **`json_agg` + `json_build_object`**: Returns the department summary *and* all nested employee drill-down records in a single query round-trip. No N+1 queries.
- **Division-by-zero protection**: Uses `NULLIF(scheduled_days, 0)`.

---

## 🛡 Production-Minded Decisions (ADRs)

| ADR | Decision | Rationale |
|---|---|---|
| **001** | Global API Envelope | All responses are wrapped in `{ success, data, meta }` via a NestJS Interceptor. All errors are normalized by a Global Exception Filter. |
| **002** | `x-request-id` | A middleware injects a unique ID into every request and logs HTTP duration, making debugging in production much easier. |
| **003** | Auth Separation | The `AuthController` handles login/JWT generation, but the `JwtStrategy` loads the user and strips the password before it reaches any endpoints. |
| **004** | Tailwind v4 | Uses the latest Tailwind v4 compiler for zero-config CSS architecture and modern styling constraints. |

---

## 📅 Next Steps / Future Improvements

If given more than 1 day, the following would be added:
1. **Multi-Tenancy (`hotel_id`)**: Inject a `hotel_id` into the JWT and enforce row-level security or global Prisma middlewares to isolate data for multiple properties.
2. **Redis Caching**: Cache the attendance report output for 5 minutes per parameter set.
3. **Leave Management**: Add a `leaves` table to distinguish between unexcused 'ABSENT' and approved PTO.
4. **Unit Tests**: Full Jest coverage for the service-level business rules (e.g., verifying the check-in vs check-out time validation).
