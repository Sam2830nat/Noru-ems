import { PrismaClient, EmployeeStatus, AttendanceStatus, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Users ──────────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('admin123', 10);
  const managerPassword = await bcrypt.hash('manager123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@norubooking.com' },
    update: {},
    create: {
      email: 'admin@norubooking.com',
      password: adminPassword,
      name: 'System Admin',
      role: UserRole.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: 'manager@norubooking.com' },
    update: {},
    create: {
      email: 'manager@norubooking.com',
      password: managerPassword,
      name: 'Hotel Manager',
      role: UserRole.MANAGER,
    },
  });

  console.log('✅ Users seeded');

  // ── Departments ────────────────────────────────────────────────────────────
  const departments = await Promise.all([
    prisma.department.upsert({ where: { name: 'Front Desk' },        update: {}, create: { name: 'Front Desk',        description: 'Guest check-in, check-out and concierge services' } }),
    prisma.department.upsert({ where: { name: 'Housekeeping' },      update: {}, create: { name: 'Housekeeping',      description: 'Room cleaning and laundry services' } }),
    prisma.department.upsert({ where: { name: 'Food & Beverage' },   update: {}, create: { name: 'Food & Beverage',   description: 'Restaurant, bar and room service' } }),
    prisma.department.upsert({ where: { name: 'Maintenance' },       update: {}, create: { name: 'Maintenance',       description: 'Facility and equipment maintenance' } }),
    prisma.department.upsert({ where: { name: 'Security' },          update: {}, create: { name: 'Security',          description: 'Guest and property security' } }),
  ]);

  console.log('✅ Departments seeded');

  // ── Roles ──────────────────────────────────────────────────────────────────
  const roles = await Promise.all([
    prisma.role.upsert({ where: { name: 'Receptionist' },    update: {}, create: { name: 'Receptionist',    description: 'Front desk guest management' } }),
    prisma.role.upsert({ where: { name: 'Housekeeper' },     update: {}, create: { name: 'Housekeeper',     description: 'Room and common area cleaning' } }),
    prisma.role.upsert({ where: { name: 'Waiter' },          update: {}, create: { name: 'Waiter',          description: 'Food and beverage service' } }),
    prisma.role.upsert({ where: { name: 'Chef' },            update: {}, create: { name: 'Chef',            description: 'Food preparation and kitchen management' } }),
    prisma.role.upsert({ where: { name: 'Technician' },      update: {}, create: { name: 'Technician',      description: 'Facility and equipment repair' } }),
    prisma.role.upsert({ where: { name: 'Security Guard' },  update: {}, create: { name: 'Security Guard',  description: 'Property and guest security' } }),
    prisma.role.upsert({ where: { name: 'Supervisor' },      update: {}, create: { name: 'Supervisor',      description: 'Team lead and operations oversight' } }),
  ]);

  console.log('✅ Roles seeded');

  // ── Shifts ─────────────────────────────────────────────────────────────────
  const shifts = await Promise.all([
    prisma.shift.upsert({ where: { name: 'Morning' },     update: {}, create: { name: 'Morning',     startTime: '06:00', endTime: '14:00', isOvernight: false, description: 'Morning shift 6am–2pm' } }),
    prisma.shift.upsert({ where: { name: 'Afternoon' },   update: {}, create: { name: 'Afternoon',   startTime: '14:00', endTime: '22:00', isOvernight: false, description: 'Afternoon shift 2pm–10pm' } }),
    prisma.shift.upsert({ where: { name: 'Night' },       update: {}, create: { name: 'Night',       startTime: '22:00', endTime: '06:00', isOvernight: true,  description: 'Overnight shift 10pm–6am' } }),
    prisma.shift.upsert({ where: { name: 'Split' },       update: {}, create: { name: 'Split',       startTime: '08:00', endTime: '20:00', isOvernight: false, description: 'Extended split shift 8am–8pm' } }),
  ]);

  console.log('✅ Shifts seeded');

  // ── Employees ──────────────────────────────────────────────────────────────
  const [frontDesk, housekeeping, fnb, maintenance, security] = departments;
  const [receptionist, housekeeper, waiter, chef, technician, securityGuard, supervisor] = roles;

  const employees = await Promise.all([
    prisma.employee.upsert({ where: { employeeNumber: 'EMP-001' }, update: {}, create: { employeeNumber: 'EMP-001', firstName: 'Sara',    lastName: 'Tesfaye',  email: 'sara.tesfaye@norubooking.com',  phone: '+251911000001', status: EmployeeStatus.ACTIVE, hireDate: new Date('2023-01-15'), departmentId: frontDesk.id,    roleId: receptionist.id } }),
    prisma.employee.upsert({ where: { employeeNumber: 'EMP-002' }, update: {}, create: { employeeNumber: 'EMP-002', firstName: 'Abebe',   lastName: 'Girma',    email: 'abebe.girma@norubooking.com',   phone: '+251911000002', status: EmployeeStatus.ACTIVE, hireDate: new Date('2022-06-01'), departmentId: housekeeping.id, roleId: housekeeper.id } }),
    prisma.employee.upsert({ where: { employeeNumber: 'EMP-003' }, update: {}, create: { employeeNumber: 'EMP-003', firstName: 'Meron',   lastName: 'Haile',    email: 'meron.haile@norubooking.com',   phone: '+251911000003', status: EmployeeStatus.ACTIVE, hireDate: new Date('2023-03-20'), departmentId: fnb.id,          roleId: waiter.id } }),
    prisma.employee.upsert({ where: { employeeNumber: 'EMP-004' }, update: {}, create: { employeeNumber: 'EMP-004', firstName: 'Dawit',   lastName: 'Bekele',   email: 'dawit.bekele@norubooking.com',  phone: '+251911000004', status: EmployeeStatus.ACTIVE, hireDate: new Date('2021-09-10'), departmentId: fnb.id,          roleId: chef.id } }),
    prisma.employee.upsert({ where: { employeeNumber: 'EMP-005' }, update: {}, create: { employeeNumber: 'EMP-005', firstName: 'Tigist',  lastName: 'Alemu',    email: 'tigist.alemu@norubooking.com',  phone: '+251911000005', status: EmployeeStatus.ACTIVE, hireDate: new Date('2023-07-01'), departmentId: housekeeping.id, roleId: housekeeper.id } }),
    prisma.employee.upsert({ where: { employeeNumber: 'EMP-006' }, update: {}, create: { employeeNumber: 'EMP-006', firstName: 'Yonas',   lastName: 'Tadesse',  email: 'yonas.tadesse@norubooking.com', phone: '+251911000006', status: EmployeeStatus.ACTIVE, hireDate: new Date('2022-11-15'), departmentId: maintenance.id, roleId: technician.id } }),
    prisma.employee.upsert({ where: { employeeNumber: 'EMP-007' }, update: {}, create: { employeeNumber: 'EMP-007', firstName: 'Hana',    lastName: 'Worku',    email: 'hana.worku@norubooking.com',    phone: '+251911000007', status: EmployeeStatus.ACTIVE, hireDate: new Date('2023-02-28'), departmentId: frontDesk.id,    roleId: receptionist.id } }),
    prisma.employee.upsert({ where: { employeeNumber: 'EMP-008' }, update: {}, create: { employeeNumber: 'EMP-008', firstName: 'Solomon', lastName: 'Gebre',    email: 'solomon.gebre@norubooking.com', phone: '+251911000008', status: EmployeeStatus.ACTIVE, hireDate: new Date('2021-05-20'), departmentId: security.id,    roleId: securityGuard.id } }),
    prisma.employee.upsert({ where: { employeeNumber: 'EMP-009' }, update: {}, create: { employeeNumber: 'EMP-009', firstName: 'Kidist',  lastName: 'Mengistu', email: 'kidist.mengistu@norubooking.com',phone: '+251911000009', status: EmployeeStatus.ACTIVE, hireDate: new Date('2020-08-01'), departmentId: fnb.id,          roleId: supervisor.id } }),
    prisma.employee.upsert({ where: { employeeNumber: 'EMP-010' }, update: {}, create: { employeeNumber: 'EMP-010', firstName: 'Biruk',   lastName: 'Assefa',   email: 'biruk.assefa@norubooking.com',  phone: '+251911000010', status: EmployeeStatus.INACTIVE,hireDate: new Date('2022-03-10'), departmentId: housekeeping.id, roleId: housekeeper.id } }),
  ]);

  console.log('✅ Employees seeded');

  // ── Attendance (last 7 days) ────────────────────────────────────────────────
  const activeEmployees = employees.filter(e => e.status === EmployeeStatus.ACTIVE);
  const today = new Date();

  for (let daysAgo = 6; daysAgo >= 0; daysAgo--) {
    const workDate = new Date(today);
    workDate.setDate(today.getDate() - daysAgo);
    workDate.setHours(0, 0, 0, 0);

    for (const emp of activeEmployees) {
      const rand = Math.random();
      let status: AttendanceStatus;
      let checkIn: Date | null = null;
      let checkOut: Date | null = null;

      if (rand < 0.75) {
        status = AttendanceStatus.PRESENT;
        checkIn = new Date(workDate); checkIn.setHours(8, Math.floor(Math.random() * 10), 0);
        checkOut = new Date(workDate); checkOut.setHours(16, Math.floor(Math.random() * 30), 0);
      } else if (rand < 0.87) {
        status = AttendanceStatus.LATE;
        checkIn = new Date(workDate); checkIn.setHours(9, Math.floor(Math.random() * 30) + 15, 0);
        checkOut = new Date(workDate); checkOut.setHours(17, 0, 0);
      } else if (rand < 0.94) {
        status = AttendanceStatus.ABSENT;
      } else {
        status = AttendanceStatus.HALF_DAY;
        checkIn = new Date(workDate); checkIn.setHours(8, 0, 0);
        checkOut = new Date(workDate); checkOut.setHours(12, 0, 0);
      }

      await prisma.attendance.upsert({
        where: { employeeId_workDate: { employeeId: emp.id, workDate } },
        update: {},
        create: { employeeId: emp.id, workDate, checkIn, checkOut, status },
      });
    }
  }

  console.log('✅ Attendance seeded (7 days)');
  console.log('\n🎉 Database seeded successfully!');
  console.log('   Admin: admin@norubooking.com / admin123');
  console.log('   Manager: manager@norubooking.com / manager123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
