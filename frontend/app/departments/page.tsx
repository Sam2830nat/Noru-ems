'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Department } from '@/lib/types';
import { Plus, Edit, Trash2, UserPlus } from 'lucide-react';
import DepartmentFormModal from '@/components/modals/DepartmentFormModal';
import AssignEmployeeToDeptModal from '@/components/modals/AssignEmployeeToDeptModal';
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | undefined>(undefined);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/departments');
      setDepartments(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreate = () => {
    setSelectedDepartment(undefined);
    setIsFormModalOpen(true);
  };

  const handleEdit = (dept: Department) => {
    setSelectedDepartment(dept);
    setIsFormModalOpen(true);
  };

  const handleAssign = (dept: Department) => {
    setSelectedDepartment(dept);
    setIsAssignModalOpen(true);
  };

  const handleDeleteClick = (dept: Department) => {
    setSelectedDepartment(dept);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDepartment) return;
    await api.delete(`/departments/${selectedDepartment.id}`);
    fetchDepartments();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--text-main)' }}>Manage Departments</h2>
        <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Department
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--hover-bg)' }}>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Name</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Description</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-center" style={{ color: 'var(--text-muted)' }}>Employees</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-right" style={{ color: 'var(--text-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center" style={{ color: 'var(--text-muted)' }}>Loading...</td></tr>
              ) : departments.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center" style={{ color: 'var(--text-muted)' }}>No departments found.</td></tr>
              ) : (
                departments.map(dept => (
                  <tr key={dept.id} className="table-row">
                    <td className="px-6 py-4 font-medium" style={{ color: 'var(--text-main)' }}>{dept.name}</td>
                    <td className="px-6 py-4 text-sm max-w-md truncate" style={{ color: 'var(--text-muted)' }}>{dept.description || '—'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-medium border"
                            style={{ backgroundColor: 'var(--hover-bg)', color: 'var(--text-main)', borderColor: 'var(--border-color)' }}>
                        {dept._count?.employees || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => handleAssign(dept)}
                          title="Assign Employee"
                          className="p-2 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400"
                        >
                          <UserPlus size={18} />
                        </button>
                        <button 
                          onClick={() => handleEdit(dept)}
                          title="Edit Department"
                          className="p-2 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(dept)}
                          title="Delete Department"
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
      </div>

      <DepartmentFormModal 
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={fetchDepartments}
        department={selectedDepartment}
      />

      <AssignEmployeeToDeptModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSuccess={fetchDepartments}
        department={selectedDepartment}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Department"
        message={`Are you sure you want to delete the ${selectedDepartment?.name} department? All employees in this department will be unassigned.`}
        verifyString="DELETE"
      />
    </div>
  );
}
