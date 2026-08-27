'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Attendance, PaginationMeta, Employee } from '@/lib/types';
import { Search, Plus, Calendar, Edit } from 'lucide-react';
import { format } from 'date-fns';
import RecordAttendanceModal from '@/components/modals/RecordAttendanceModal';

function AttendanceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [records, setRecords] = useState<Attendance[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  
  const pageParam = searchParams.get('page');
  const [page, setPage] = useState(pageParam ? parseInt(pageParam) : 1);
  const employeeId = searchParams.get('employeeId') || '';
  const date = searchParams.get('date') || '';
  
  const [search, setSearch] = useState('');

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Attendance | undefined>(undefined);

  useEffect(() => {
    api.get('/employees', { params: { limit: 100 } }).then(res => setEmployees(res.data.data));
  }, []);

  const fetchAttendance = async (p = page, s = search) => {
    setLoading(true);
    try {
      const res = await api.get('/attendance', {
        params: { 
          page: p, 
          limit: 15,
          employeeId: employeeId || undefined,
          startDate: date || undefined,
          endDate: date || undefined,
          search: s || undefined
        }
      });
      setRecords(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance(page, search);
  }, [page, employeeId, date]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (page !== 1) {
        setPage(1); // changing page will trigger the other useEffect
      } else {
        fetchAttendance(1, search);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/attendance?${params.toString()}`);
  };

  const handleDateFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (val) params.set('date', val);
    else params.delete('date');
    params.set('page', '1');
    router.push(`/attendance?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              className="input pl-9"
              placeholder="Search employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative w-full sm:w-auto">
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="date"
              className="input pl-9"
              value={date}
              onChange={handleDateFilter}
            />
          </div>
          {employeeId && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Filtered by employee</span>
              <button 
                onClick={() => router.push('/attendance')}
                className="text-xs text-indigo-400 hover:underline"
              >
                Clear filter
              </button>
            </div>
          )}
        </div>
        <button 
          onClick={() => { setSelectedRecord(undefined); setIsModalOpen(true); }}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Record Attendance
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--hover-bg)' }}>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Date</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Employee</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Status</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Check In/Out</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Notes</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-right" style={{ color: 'var(--text-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && records.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center" style={{ color: 'var(--text-muted)' }}>Loading...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No attendance records found.</td></tr>
              ) : (
                records.map(record => (
                  <tr key={record.id} className="table-row">
                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap" style={{ color: 'var(--text-main)' }}>
                      {format(new Date(record.workDate), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>
                        <Link href={`/employees/${record.employeeId}`} className="hover:text-indigo-500 hover:underline transition-colors">
                          {record.employee?.firstName} {record.employee?.lastName}
                        </Link>
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{record.employee?.employeeNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${
                        record.status === 'PRESENT' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        record.status === 'ABSENT' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        record.status === 'LATE' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      } border`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm" style={{ color: 'var(--text-main)' }}>
                        In: <span style={{ color: 'var(--text-muted)' }}>{record.checkIn ? format(new Date(record.checkIn), 'h:mm a') : '—'}</span>
                      </div>
                      <div className="text-sm" style={{ color: 'var(--text-main)' }}>
                        Out: <span style={{ color: 'var(--text-muted)' }}>{record.checkOut ? format(new Date(record.checkOut), 'h:mm a') : '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm max-w-xs truncate" style={{ color: 'var(--text-muted)' }}>
                      {record.notes || '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => { setSelectedRecord(record); setIsModalOpen(true); }}
                        className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-indigo-400/10 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-700/50 flex items-center justify-between">
            <div className="text-sm text-slate-400">
              Showing <span className="font-medium text-white">{((meta.page - 1) * meta.limit) + 1}</span> to <span className="font-medium text-white">{Math.min(meta.page * meta.limit, meta.total)}</span> of <span className="font-medium text-white">{meta.total}</span> results
            </div>
            <div className="flex gap-2">
              <button
                disabled={meta.page === 1}
                onClick={() => handlePageChange(meta.page - 1)}
                className="btn-secondary py-1.5 px-3 text-xs"
              >
                Previous
              </button>
              <button
                disabled={meta.page === meta.totalPages}
                onClick={() => handlePageChange(meta.page + 1)}
                className="btn-secondary py-1.5 px-3 text-xs"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <RecordAttendanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchAttendance()}
        attendance={selectedRecord}
        employees={employees}
      />
    </div>
  );
}

export default function AttendancePage() {
  return (
    <Suspense fallback={
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
      </div>
    }>
      <AttendanceContent />
    </Suspense>
  );
}
