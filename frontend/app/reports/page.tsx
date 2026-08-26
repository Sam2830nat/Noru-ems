'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { DeptAttendanceSummary } from '@/lib/types';
import { format, subDays } from 'date-fns';
import { Calendar, Search, Download, ChevronDown, ChevronUp } from 'lucide-react';

export default function ReportsPage() {
  const [reports, setReports] = useState<DeptAttendanceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDept, setExpandedDept] = useState<string | null>(null);
  
  // Date state
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/attendance', {
        params: { startDate, endDate }
      });
      setReports(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []); // Initial load

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex-1 max-w-2xl flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="label">Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="date"
                className="input pl-9"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="label">End Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="date"
                className="input pl-9"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-end">
            <button onClick={fetchReports} className="btn-primary w-full md:w-auto flex items-center justify-center gap-2">
              <Search size={16} />
              Generate
            </button>
          </div>
        </div>
        <button className="btn-secondary flex items-center gap-2">
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
        </div>
      ) : reports.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-slate-400">No attendance data found for the selected period.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((dept) => {
            const isExpanded = expandedDept === dept.departmentId;
            return (
              <div key={dept.departmentId || 'unassigned'} className="glass-card overflow-hidden">
                <div 
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-800 transition-colors"
                  onClick={() => setExpandedDept(isExpanded ? null : (dept.departmentId || 'unassigned'))}
                >
                  <div className="flex items-center gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{dept.departmentName}</h3>
                      <p className="text-sm text-slate-400">{dept.totalEmployees} employees</p>
                    </div>
                    <div className="hidden sm:flex gap-4 items-center">
                      <div className="text-center px-4 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">
                        <div className="text-xs text-emerald-400 font-medium">Present</div>
                        <div className="text-lg font-bold text-emerald-100">{dept.totalPresentDays}</div>
                      </div>
                      <div className="text-center px-4 py-1 rounded bg-red-500/10 border border-red-500/20">
                        <div className="text-xs text-red-400 font-medium">Absent</div>
                        <div className="text-lg font-bold text-red-100">{dept.totalAbsentDays}</div>
                      </div>
                      <div className="text-center px-4 py-1 rounded bg-amber-500/10 border border-amber-500/20">
                        <div className="text-xs text-amber-400 font-medium">Late</div>
                        <div className="text-lg font-bold text-amber-100">{dept.totalLateDays}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Rate</div>
                      <div className={`text-xl font-bold ${
                        dept.deptAttendancePct >= 95 ? 'text-emerald-400' : 
                        dept.deptAttendancePct >= 85 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {dept.deptAttendancePct}%
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="text-slate-500" /> : <ChevronDown className="text-slate-500" />}
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="border-t border-slate-700 bg-slate-900/50">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-700">
                            <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Employee</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Scheduled</th>
                            <th className="px-6 py-3 text-xs font-semibold text-emerald-400 uppercase tracking-wider text-right">Present</th>
                            <th className="px-6 py-3 text-xs font-semibold text-red-400 uppercase tracking-wider text-right">Absent</th>
                            <th className="px-6 py-3 text-xs font-semibold text-amber-400 uppercase tracking-wider text-right">Late</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dept.employees.map((emp) => (
                            <tr key={emp.employeeId} className="table-row">
                              <td className="px-6 py-3 whitespace-nowrap">
                                <div className="text-sm font-medium text-white">{emp.fullName}</div>
                                <div className="text-xs text-slate-400">{emp.employeeNumber} &bull; {emp.role || 'No Role'}</div>
                              </td>
                              <td className="px-6 py-3 text-sm text-slate-300 text-right">{emp.scheduledDays}</td>
                              <td className="px-6 py-3 text-sm text-emerald-400 text-right font-medium">{emp.daysPresent}</td>
                              <td className="px-6 py-3 text-sm text-red-400 text-right font-medium">{emp.daysAbsent}</td>
                              <td className="px-6 py-3 text-sm text-amber-400 text-right font-medium">{emp.daysLate}</td>
                              <td className="px-6 py-3 text-sm text-right font-bold">
                                <span className={
                                  emp.attendancePct >= 95 ? 'text-emerald-400' : 
                                  emp.attendancePct >= 85 ? 'text-amber-400' : 'text-red-400'
                                }>{emp.attendancePct}%</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
