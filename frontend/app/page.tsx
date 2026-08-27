'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { DashboardMetrics } from '@/lib/types';
import { Users, Building2, UserCheck, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/dashboard')
      .then(res => setMetrics(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!metrics) return null;

  const statCards = [
    {
      title: 'Total Employees',
      value: metrics.totalEmployees,
      sub: `${metrics.activeEmployees} active, ${metrics.inactiveEmployees} inactive`,
      icon: Users,
      color: 'text-blue-500 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-400/10',
      href: '/employees'
    },
    {
      title: "Today's Attendance",
      value: `${metrics.todayAttendance.attendanceRate}%`,
      sub: `${metrics.todayAttendance.present} present, ${metrics.todayAttendance.absent} absent`,
      icon: UserCheck,
      color: 'text-emerald-500 dark:text-emerald-400',
      bg: 'bg-emerald-100 dark:bg-emerald-400/10',
      href: '/attendance'
    },
    {
      title: 'Late Today',
      value: metrics.todayAttendance.late,
      sub: 'Needs attention',
      icon: AlertTriangle,
      color: 'text-amber-500 dark:text-amber-400',
      bg: 'bg-amber-100 dark:bg-amber-400/10',
      href: '/attendance'
    },
    {
      title: 'Departments',
      value: metrics.totalDepartments,
      sub: `${metrics.totalRoles} unique roles defined`,
      icon: Building2,
      color: 'text-purple-500 dark:text-purple-400',
      bg: 'bg-purple-100 dark:bg-purple-400/10',
      href: '/departments'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Link href={stat.href} key={i} className="glass-card p-6 flex flex-col relative overflow-hidden group hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 right-0 p-6 opacity-10 dark:opacity-20 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-300">
                <Icon size={80} className={stat.color} />
              </div>
              <div className="flex items-center gap-4 mb-4 z-10">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{stat.title}</h3>
              </div>
              <div className="mt-auto z-10">
                <div className="text-3xl font-bold mb-1" style={{ color: 'var(--text-main)' }}>{stat.value}</div>
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{stat.sub}</div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6">
          <h2 className="text-lg font-semibold mb-6" style={{ color: 'var(--text-main)' }}>Today's Attendance by Department</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics.departmentBreakdown}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="department" stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)', fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: 'var(--hover-bg)'}}
                  contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)' }}
                />
                <Legend />
                <Bar dataKey="present" name="Present" fill="#34d399" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" name="Absent" fill="#f87171" radius={[4, 4, 0, 0]} />
                <Bar dataKey="late" name="Late" fill="#fbbf24" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col">
          <h2 className="text-lg font-semibold mb-6" style={{ color: 'var(--text-main)' }}>Quick Actions</h2>
          <div className="space-y-3 flex-1">
            <Link href="/attendance" className="w-full text-left px-4 py-3 rounded-lg border transition-colors flex items-center justify-between group"
                  style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
              <div>
                <div className="text-sm font-medium group-hover:text-indigo-500" style={{ color: 'var(--text-main)' }}>Record Attendance</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Manual entry for today</div>
              </div>
              <UserCheck size={20} className="group-hover:text-indigo-500" style={{ color: 'var(--text-muted)' }} />
            </Link>
            <Link href="/employees" className="w-full text-left px-4 py-3 rounded-lg border transition-colors flex items-center justify-between group"
                  style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
              <div>
                <div className="text-sm font-medium group-hover:text-indigo-500" style={{ color: 'var(--text-main)' }}>Add New Employee</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Onboard staff member</div>
              </div>
              <Users size={20} className="group-hover:text-indigo-500" style={{ color: 'var(--text-muted)' }} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
