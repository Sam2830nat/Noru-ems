'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Employee, PaginationMeta } from '@/lib/types';
import { Search, Plus, Eye, Edit2, Trash2, CalendarPlus, Power, PowerOff } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import EmployeeFormModal from '@/components/modals/EmployeeFormModal';
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal';
import ActionConfirmationModal from '@/components/modals/ActionConfirmationModal';
import AssignShiftModal from '@/components/modals/AssignShiftModal';
import EmployeeDetailDrawer from '@/components/drawers/EmployeeDetailDrawer';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | undefined>(undefined);

  const fetchEmployees = async (p = 1, s = search) => {
    setLoading(true);
    try {
      const res = await api.get('/employees', {
        params: { page: p, limit: 8, search: s || undefined }
      });
      setEmployees(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees(page, search);
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchEmployees(1, search);
  };

  const handleCreate = () => {
    setSelectedEmployee(undefined);
    setIsFormModalOpen(true);
  };

  const handleEdit = (emp: Employee) => {
    setSelectedEmployee(emp);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (emp: Employee) => {
    setSelectedEmployee(emp);
    setIsDeleteModalOpen(true);
  };

  const handleAssignShiftClick = (emp: Employee) => {
    setSelectedEmployee(emp);
    setIsShiftModalOpen(true);
  };

  const handleStatusClick = (emp: Employee) => {
    setSelectedEmployee(emp);
    setIsStatusModalOpen(true);
  };

  const handleViewClick = (emp: Employee) => {
    setSelectedEmployee(emp);
    setIsDrawerOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEmployee) return;
    try {
      await api.delete(`/employees/${selectedEmployee.id}`);
      toast.success('Employee deleted successfully');
      fetchEmployees(page, search);
    } catch (err) {
      toast.error('Failed to delete employee');
    }
  };

  const handleStatusConfirm = async () => {
    if (!selectedEmployee) return;
    const newStatus = selectedEmployee.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.patch(`/employees/${selectedEmployee.id}`, { status: newStatus });
      toast.success(`Employee ${newStatus === 'ACTIVE' ? 'activated' : 'inactivated'} successfully`);
      fetchEmployees(page, search);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
          <input
            type="text"
            className="input pl-10"
            placeholder="Search by name, email, or number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
        <button onClick={handleCreate} className="btn-primary flex items-center justify-center gap-2">
          <Plus size={18} />
          Add Employee
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--hover-bg)' }}>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Employee</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Department & Role</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Status</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Hire Date</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-right" style={{ color: 'var(--text-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && employees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center" style={{ color: 'var(--text-muted)' }}>Loading employees...</td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center" style={{ color: 'var(--text-muted)' }}>No employees found.</td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="table-row">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full flex items-center justify-center font-bold"
                             style={{ backgroundColor: 'var(--hover-bg)', color: 'var(--btn-primary-bg)' }}>
                          {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium">
                            <Link href={`/employees/${emp.id}`} className="hover:underline hover:text-indigo-600 transition-colors" style={{ color: 'var(--text-main)' }}>
                              {emp.firstName} {emp.lastName}
                            </Link>
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{emp.employeeNumber} &bull; {emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>{emp.department?.name || '—'}</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{emp.role?.name || '—'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${
                        emp.status === 'ACTIVE' 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' 
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400 border border-slate-200 dark:border-slate-500/20'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-muted)' }}>
                      {format(new Date(emp.hireDate), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => handleAssignShiftClick(emp)}
                          title="Assign Shift"
                          className="p-2 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-500 hover:text-purple-600 dark:hover:text-purple-400"
                        >
                          <CalendarPlus size={18} />
                        </button>
                        <button 
                          onClick={() => handleStatusClick(emp)}
                          title={emp.status === 'ACTIVE' ? "Inactivate Employee" : "Activate Employee"}
                          className={`p-2 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-500 ${emp.status === 'ACTIVE' ? 'hover:text-amber-600 dark:hover:text-amber-400' : 'hover:text-emerald-600 dark:hover:text-emerald-400'}`}
                        >
                          {emp.status === 'ACTIVE' ? <PowerOff size={18} /> : <Power size={18} />}
                        </button>
                        <button 
                          onClick={() => handleViewClick(emp)} 
                          title="View Details"
                          className="p-2 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleEdit(emp)}
                          title="Edit Employee"
                          className="p-2 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(emp)}
                          title="Delete Employee"
                          className="p-2 rounded-lg transition-colors hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-500 hover:text-red-600 dark:hover:text-red-400"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {meta && meta.totalPages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Showing <span className="font-medium" style={{ color: 'var(--text-main)' }}>{((meta.page - 1) * meta.limit) + 1}</span> to <span className="font-medium" style={{ color: 'var(--text-main)' }}>{Math.min(meta.page * meta.limit, meta.total)}</span> of <span className="font-medium" style={{ color: 'var(--text-main)' }}>{meta.total}</span> results
            </div>
            <div className="flex gap-2">
              <button
                disabled={meta.page === 1}
                onClick={() => setPage(p => p - 1)}
                className="btn-secondary py-1.5 px-3 text-xs"
              >
                Previous
              </button>
              <button
                disabled={meta.page === meta.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="btn-secondary py-1.5 px-3 text-xs"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <EmployeeFormModal 
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={() => fetchEmployees(page, search)}
        employee={selectedEmployee}
      />

      <AssignShiftModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        onSuccess={() => fetchEmployees(page, search)}
        employee={selectedEmployee}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Employee"
        message={`Are you sure you want to completely delete ${selectedEmployee?.firstName} ${selectedEmployee?.lastName}? This action is irreversible and will erase all their attendance and shift history.`}
        verifyString="DELETE"
      />

      <ActionConfirmationModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onConfirm={handleStatusConfirm}
        title={selectedEmployee?.status === 'ACTIVE' ? "Inactivate Employee" : "Activate Employee"}
        message={`Are you sure you want to ${selectedEmployee?.status === 'ACTIVE' ? 'inactivate' : 'activate'} ${selectedEmployee?.firstName} ${selectedEmployee?.lastName}?`}
        verifyString={selectedEmployee?.status === 'ACTIVE' ? "INACTIVATE" : "ACTIVATE"}
        actionButtonText={selectedEmployee?.status === 'ACTIVE' ? "Inactivate" : "Activate"}
        isDestructive={selectedEmployee?.status === 'ACTIVE'}
      />

      <EmployeeDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        employeeId={selectedEmployee?.id || null}
      />
    </div>
  );
}
