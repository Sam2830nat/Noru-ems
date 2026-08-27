import React, { useEffect, useState } from 'react';
import { X, Mail, Phone, Calendar as CalendarIcon, Briefcase, Building2, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { Employee, EmployeeShift, Attendance } from '@/lib/types';
import { format } from 'date-fns';

type EmployeeDetail = Employee & {
  shifts: EmployeeShift[];
  attendance: Attendance[];
};

interface EmployeeDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string | null;
}

export default function EmployeeDetailDrawer({ isOpen, onClose, employeeId }: EmployeeDetailDrawerProps) {
  const [employee, setEmployee] = useState<EmployeeDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && employeeId) {
      setLoading(true);
      api.get(`/employees/${employeeId}`)
        .then(res => setEmployee(res.data.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setEmployee(null);
    }
  }, [isOpen, employeeId]);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 w-full max-w-md bg-[var(--bg-main)] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ borderLeft: '1px solid var(--border-color)' }}
      >
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>Employee Details</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-[var(--text-main)] transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="animate-spin text-indigo-500" size={32} />
            </div>
          ) : !employee ? (
            <div className="text-center text-slate-500 py-10">Select an employee to view details</div>
          ) : (
            <>
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

              {/* Recent Shifts */}
              <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-slate-700/50">
                  <h3 className="font-semibold text-white">Upcoming & Recent Shifts</h3>
                </div>
                <div className="p-0">
                  {employee.shifts.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-500">No shifts assigned.</div>
                  ) : (
                    <ul className="divide-y divide-slate-700/50">
                      {employee.shifts.slice(0, 3).map(s => (
                        <li key={s.id} className="p-4 flex justify-between items-center hover:bg-slate-800/30">
                          <div>
                            <div className="text-sm font-medium text-white">{s.shift.name}</div>
                            <div className="text-xs text-slate-400">{s.shift.startTime} – {s.shift.endTime}</div>
                          </div>
                          <div className="text-xs text-slate-300 bg-slate-800 px-2 py-1 rounded">
                            {format(new Date(s.assignedDate), 'MMM d')}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

            </>
          )}
        </div>
      </div>
    </>
  );
}
