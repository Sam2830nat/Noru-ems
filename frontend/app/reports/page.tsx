'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { DeptAttendanceSummary } from '@/lib/types';
import { format, subDays } from 'date-fns';
import { Calendar, Search, Download, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import ExportReportModal from '@/components/modals/ExportReportModal';

export default function ReportsPage() {
  const [reports, setReports] = useState<DeptAttendanceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDept, setExpandedDept] = useState<string | null>(null);
  
  // Date state
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

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
        <button 
          onClick={() => setIsExportModalOpen(true)}
          className="btn-secondary flex items-center gap-2 border border-indigo-500/30 hover:border-indigo-500/60 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition-all shadow-lg shadow-indigo-500/10"
        >
          <FileText size={18} />
          Export Report
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
                    <div className="w-48">
                      <h3 className="text-xl font-bold text-white tracking-tight">{dept.departmentName}</h3>
                      <p className="text-sm text-slate-400 mt-0.5">{dept.totalEmployees} employees</p>
                    </div>
                    <div className="hidden sm:flex gap-3 items-center">
                      <div className="flex flex-col items-center justify-center w-20 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-inner">
                        <div className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold mb-1">Present</div>
                        <div className="text-xl font-black text-emerald-100">{dept.totalPresentDays}</div>
                      </div>
                      <div className="flex flex-col items-center justify-center w-20 py-2 rounded-xl bg-red-500/10 border border-red-500/20 shadow-inner">
                        <div className="text-[10px] uppercase tracking-wider text-red-400 font-semibold mb-1">Absent</div>
                        <div className="text-xl font-black text-red-100">{dept.totalAbsentDays}</div>
                      </div>
                      <div className="flex flex-col items-center justify-center w-20 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 shadow-inner">
                        <div className="text-[10px] uppercase tracking-wider text-amber-400 font-semibold mb-1">Late</div>
                        <div className="text-xl font-black text-amber-100">{dept.totalLateDays}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-0.5">Attendance Rate</div>
                      <div className={`text-2xl font-black drop-shadow-md ${
                        dept.deptAttendancePct >= 95 ? 'text-emerald-400' : 
                        dept.deptAttendancePct >= 85 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {dept.deptAttendancePct}%
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
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
      
      <ExportReportModal 
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        startDate={startDate}
        endDate={endDate}
        reportData={reports.map(dept => ({
          department: dept.departmentName,
          total: dept.totalEmployees,
          present: dept.totalPresentDays,
          absent: dept.totalAbsentDays,
          late: dept.totalLateDays,
          rate: `${dept.deptAttendancePct}%`
        }))}
      />
    </div>
  );
}
