# Noru Hotel Employee Management System (EMS)

A production-ready, full-stack Employee Management System built as a technical challenge for Noru Booking. It demonstrates senior-level engineering judgment, modular monolith architecture, robust relational data modeling, and a highly polished modern UI.

---

## 🏗 Architecture & Tech Stack

### Architecture: Modular Monolith
The application is structured as a **Modular Monolith**. 
Microservices introduce distributed systems complexity (network latency, distributed transactions, independent deployments) that provides zero benefit at this scale. A modular monolith gives us strict domain isolation through explicit module boundaries (`Employees`, `Departments`, `Roles`, `Shifts`, `Attendance`, `Reports`). It ships faster, is easier to maintain, and allows future extraction of specific modules (e.g., Attendance becomes its own microservice) only when load or team size genuinely justifies it.

### Tech Stack
**Backend (`/backend`)**
* **Framework:** NestJS (TypeScript, Strict Mode)
* **Database & ORM:** PostgreSQL + Prisma ORM v5
* **Validation & Types:** `class-validator`, `class-transformer`
* **Security & Auth:** Passport, JWT, bcryptjs
* **Documentation:** Swagger / OpenAPI (`@nestjs/swagger`)

**Frontend (`/frontend`)**
* **Framework:** Next.js 14 (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS v4 (Custom Glassmorphism, CSS Variables for Dark/Light Themes)
* **State & Data:** React Hooks, Axios (with custom JWT interceptors)
* **UI/UX:** `lucide-react` (icons), `react-hot-toast` (notifications), debounced live-search, and a unified Modal/Drawer architecture
* **Reporting Engine:** Client-side PDF (`jspdf`, `jspdf-autotable`) and CSV exports

**Infrastructure**
* **Containerization:** Docker & Docker Compose (Multi-stage builds)

---

## 🚀 How to Run (Docker)

The entire application is completely containerized. The easiest way to run the project is using Docker Compose, which will spin up the database, automatically run migrations, seed the database, and start both the backend and frontend.

```bash
# Clone the repository
git clone <repo-url>
cd Noru-ems

# Step 1: Install local dependencies (backend + frontend)
# This only needs to be run ONCE after cloning.
# npm run noru:start calls this automatically, but you can run it separately.
npm run setup

# Step 2: Build Docker images and start all services
npm run noru:start
```

**Access Points:**
- **Frontend Application:** [http://localhost:3000](http://localhost:3000)
- **Backend API Base:** [http://localhost:3001/api/v1](http://localhost:3001/api/v1)
- **API Swagger Docs:** [http://localhost:3001/api/docs](http://localhost:3001/api/docs)

**Demo Credentials:**
The automated seed script populates the database with 10 employees, departments, and 7 days of historical attendance data. You can log in using:
- **Email:** `admin@norubooking.com`
- **Password:** `admin123`

### ⚠️ Troubleshooting (Memory/Disk Space)
This application is fully tested and stable. However, building Next.js and NestJS Docker images simultaneously can sometimes consume significant system resources. 
If the build process fails, hangs, or throws an error (e.g., `ENOSPC`, `Killed`, or `FATAL ERROR: Reached heap limit Allocation failed`), it is highly likely due to a lack of Docker memory or system disk space on your local machine.

**To resolve this:**
1. Clean up Docker disk space by running: `docker system prune -af --volumes`
2. Ensure Docker has at least 4GB of RAM allocated in your Docker Desktop settings.
3. Try building the containers one by one instead of concurrently:
   ```bash
   docker compose build backend
   docker compose build frontend
   docker compose up -d
   ```

---

## 💻 How to Run (Local Development)

If you prefer to run the applications locally without Docker (e.g., for active development):

### 1. Database
You must have a PostgreSQL instance running. If you want to use Docker just for the database:
```bash
docker-compose up postgres -d
```

### 2. Backend
```bash
cd backend

# Install dependencies
npm install

# Run database migrations (creates tables)
npm run migrate

# Seed the database with demo data
npm run db:seed

# Start the NestJS server in watch mode
npm run start:dev
```

### 3. Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start the Next.js development server
npm run dev
```

---

## 🛠 Available Commands

### Root (`/package.json`)
| Command | Description |
|---|---|
| `npm run setup` | **Run once after cloning.** Installs `node_modules` for both backend and frontend locally |
| `npm run noru:start` | Runs `setup` then builds Docker images and starts all services |
| `npm run noru:stop` | Stops all running Docker containers |
| `npm run noru:clean` | Stops all containers and removes volumes/images (full reset) |
| `npm run noru:restart` | Removes orphaned containers and does a fresh start |
| `npm run backend:dev` | Starts the NestJS server locally in watch mode |
| `npm run frontend:dev` | Starts the Next.js server locally in watch mode |

### Backend (`/backend/package.json`)
| Command | Description |
|---|---|
| `npm run start:dev` | Starts the NestJS API with hot-reload |
| `npm run build` | Compiles the TypeScript application into `/dist` |
| `npm run migrate` | Runs `prisma migrate dev` to apply schema changes |
| `npm run migrate:deploy` | Applies migrations in production without resetting data |
| `npm run db:seed` | Executes `prisma/seed.ts` to populate realistic hotel data |
| `npm run db:studio` | Opens Prisma Studio UI at `localhost:5555` to view DB tables |
| `npm run db:reset` | Drops the database, reapplies migrations, and runs the seed script |
| `npm run test:e2e` | Runs end-to-end integration tests using Jest and Supertest |

### Frontend (`/frontend/package.json`)
| Command | Description |
|---|---|
| `npm run dev` | Starts the Next.js development server |
| `npm run build` | Builds the Next.js application for production |
| `npm run lint` | Runs ESLint to check for code quality issues |

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

## 🚀 Key Features

* **Real-Time Search Engine**: Implemented debounced, keystroke-level instant search filtering across all management pages (Employees, Departments, Roles, Shifts, Attendance).
* **Modal-Driven Architecture**: Fully standardized CRUD operations using responsive, animated Modals and slide-out Drawers to maintain user context without aggressive page reloads.
* **Smart Deletion & Status Lifecycle**: Hard deletes where appropriate (protected by verification modals) and soft status toggles (Active/Inactive) for core entities to preserve historical data.
* **Native Exporting**: The reporting module generates high-quality `PDF` and `CSV` files entirely on the client-side, reducing server load.

## 🌟 Bonus: Multi-Tenancy Architecture (Isolated Branch)

I have also architected a full **Multi-Tenant SaaS** version of this application as a bonus, allowing multiple distinct properties (Hotels/Hospitals) to be managed securely from a single database with strict data isolation.

This advanced implementation is available on a separate Git branch: **`feature/multitenancy`**. 

**How to test the Multi-Tenant version:**
1. Check out the branch: `git checkout feature/multitenancy`
2. Run `docker compose up -d` 
*(Note: To prevent any interference with this `main` branch, the multitenancy branch uses completely isolated ports (4000/4001) and a separate Docker Postgres volume, so you can safely run both versions at the exact same time).*

---

## 🛡 Production-Minded Decisions (ADRs)

| ADR | Decision | Rationale |
|---|---|---|
| **001** | Global API Envelope | All responses are wrapped in `{ success, data, meta }` via a NestJS Interceptor. All errors are normalized by a Global Exception Filter. |
| **002** | `x-request-id` | A middleware injects a unique ID into every request and logs HTTP duration, making debugging in production much easier. |
| **003** | Auth Separation | The `AuthController` handles login/JWT generation, but the `JwtStrategy` loads the user and strips the password before it reaches any endpoints. |
| **004** | Docker Healthchecks | The backend waits for PostgreSQL to be explicitly `healthy` before attempting to run migrations, preventing crash-loops on cold starts. |
