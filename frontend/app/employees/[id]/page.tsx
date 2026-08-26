'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Employee, EmployeeShift, Attendance } from '@/lib/types';
import { ArrowLeft, Edit, Trash2, Mail, Phone, Calendar as CalendarIcon, Briefcase, Building2, UserCircle } from 'lucide-react';
import { format } from 'date-fns';

type EmployeeDetail = Employee & {
  shifts: EmployeeShift[];
  attendance: Attendance[];
};

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [employee, setEmployee] = useState<EmployeeDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    api.get(`/employees/${params.id}`)
      .then(res => setEmployee(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleDeactivate = async () => {
    if (!confirm('Are you sure you want to deactivate this employee? They will no longer be able to be scheduled, but their history will remain.')) return;
    try {
      await api.delete(`/employees/${params.id}`);
      // Refresh
      const res = await api.get(`/employees/${params.id}`);
      setEmployee(res.data.data);
    } catch (err) {
      console.error(err);
      alert('Failed to deactivate employee.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-white">Employee not found</h2>
        <Link href="/employees" className="text-indigo-400 hover:underline mt-2 inline-block">Back to employees</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/employees" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={16} /> Back to Employees
        </Link>
        <div className="flex items-center gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Edit size={16} /> Edit
          </button>
          {employee.status === 'ACTIVE' && (
            <button onClick={handleDeactivate} className="btn-danger flex items-center gap-2">
              <Trash2 size={16} /> Deactivate
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="glass-card p-6 flex flex-col items-center text-center">
          <div className="h-24 w-24 rounded-full bg-indigo-600/20 border-2 border-indigo-500 flex items-center justify-center text-indigo-400 font-bold text-3xl mb-4 shadow-lg shadow-indigo-500/20">
            {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">{employee.firstName} {employee.lastName}</h2>
          <p className="text-slate-400 mb-3">{employee.employeeNumber}</p>
          <span className={`badge mb-6 ${
            employee.status === 'ACTIVE' 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
              : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
          }`}>
            {employee.status}
          </span>

          <div className="w-full space-y-4 text-left border-t border-slate-700/50 pt-6">
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <Mail size={16} className="text-slate-500" /> {employee.email}
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <Phone size={16} className="text-slate-500" /> {employee.phone || 'No phone provided'}
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <Building2 size={16} className="text-slate-500" /> {employee.department?.name || 'Unassigned'}
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <Briefcase size={16} className="text-slate-500" /> {employee.role?.name || 'Unassigned'}
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <CalendarIcon size={16} className="text-slate-500" /> Hired {format(new Date(employee.hireDate), 'MMM d, yyyy')}
            </div>
          </div>
        </div>

        {/* Details & History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card overflow-hidden">
            <div className="p-5 border-b border-slate-700/50 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Recent Attendance</h3>
              <Link href={`/attendance?employeeId=${employee.id}`} className="text-sm text-indigo-400 hover:underline">View all</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-900/30">
                    <th className="px-5 py-3 text-xs font-semibold text-slate-400">Date</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-400">Status</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-400">Check In</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-400">Check Out</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {employee.attendance.length === 0 ? (
                    <tr><td colSpan={4} className="px-5 py-6 text-center text-slate-500 text-sm">No attendance records found.</td></tr>
                  ) : employee.attendance.map(a => (
                    <tr key={a.id} className="hover:bg-slate-800/30">
                      <td className="px-5 py-3 text-sm text-slate-200">{format(new Date(a.workDate), 'MMM d, yyyy')}</td>
                      <td className="px-5 py-3">
                        <span className={`badge ${
                          a.status === 'PRESENT' ? 'bg-emerald-500/10 text-emerald-400' :
                          a.status === 'ABSENT' ? 'bg-red-500/10 text-red-400' :
                          a.status === 'LATE' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'
                        }`}>{a.status}</span>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-400">{a.checkIn ? format(new Date(a.checkIn), 'h:mm a') : '—'}</td>
                      <td className="px-5 py-3 text-sm text-slate-400">{a.checkOut ? format(new Date(a.checkOut), 'h:mm a') : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="p-5 border-b border-slate-700/50 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Upcoming & Recent Shifts</h3>
              <button className="text-sm text-indigo-400 hover:underline">Assign shift</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-900/30">
                    <th className="px-5 py-3 text-xs font-semibold text-slate-400">Date</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-400">Shift Name</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-400">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {employee.shifts.length === 0 ? (
                    <tr><td colSpan={3} className="px-5 py-6 text-center text-slate-500 text-sm">No shifts assigned.</td></tr>
                  ) : employee.shifts.map(s => (
                    <tr key={s.id} className="hover:bg-slate-800/30">
                      <td className="px-5 py-3 text-sm text-slate-200">{format(new Date(s.assignedDate), 'MMM d, yyyy')}</td>
                      <td className="px-5 py-3 text-sm text-white font-medium">{s.shift.name}</td>
                      <td className="px-5 py-3 text-sm text-slate-400">{s.shift.startTime} – {s.shift.endTime} {s.shift.isOvernight ? '(Overnight)' : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
