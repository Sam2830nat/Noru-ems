'use client';

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
      color: 'text-blue-400',
      bg: 'bg-blue-400/10'
    },
    {
      title: "Today's Attendance",
      value: `${metrics.todayAttendance.attendanceRate}%`,
      sub: `${metrics.todayAttendance.present} present, ${metrics.todayAttendance.absent} absent`,
      icon: UserCheck,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10'
    },
    {
      title: 'Late Today',
      value: metrics.todayAttendance.late,
      sub: 'Needs attention',
      icon: AlertTriangle,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10'
    },
    {
      title: 'Departments',
      value: metrics.totalDepartments,
      sub: `${metrics.totalRoles} unique roles defined`,
      icon: Building2,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-20 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-300">
                <Icon size={80} className={stat.color} />
              </div>
              <div className="flex items-center gap-4 mb-4 z-10">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">{stat.title}</h3>
              </div>
              <div className="mt-auto z-10">
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Today's Attendance by Department</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics.departmentBreakdown}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="department" stroke="#94a3b8" tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: '#1e293b'}}
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
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
          <h2 className="text-lg font-semibold text-white mb-6">Quick Actions</h2>
          <div className="space-y-3 flex-1">
            <button className="w-full text-left px-4 py-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center justify-between group">
              <div>
                <div className="text-sm font-medium text-white group-hover:text-indigo-400">Record Attendance</div>
                <div className="text-xs text-slate-400 mt-1">Manual entry for today</div>
              </div>
              <UserCheck size={20} className="text-slate-500 group-hover:text-indigo-400" />
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center justify-between group">
              <div>
                <div className="text-sm font-medium text-white group-hover:text-indigo-400">Add New Employee</div>
                <div className="text-xs text-slate-400 mt-1">Onboard staff member</div>
              </div>
              <Users size={20} className="text-slate-500 group-hover:text-indigo-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
