'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Role } from '@/lib/types';
import { Plus, Edit, Trash2, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import RoleFormModal from '@/components/modals/RoleFormModal';
import AssignEmployeeToRoleModal from '@/components/modals/AssignEmployeeToRoleModal';
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal';

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | undefined>(undefined);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/roles');
      setRoles(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleCreate = () => {
    setSelectedRole(undefined);
    setIsFormModalOpen(true);
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setIsFormModalOpen(true);
  };

  const handleAssign = (role: Role) => {
    setSelectedRole(role);
    setIsAssignModalOpen(true);
  };

  const handleDeleteClick = (role: Role) => {
    setSelectedRole(role);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRole) return;
    try {
      await api.delete(`/roles/${selectedRole.id}`);
      toast.success('Role deleted successfully');
      fetchRoles();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete role');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--text-main)' }}>Manage Roles</h2>
        <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Role
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
              ) : roles.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center" style={{ color: 'var(--text-muted)' }}>No roles found.</td></tr>
              ) : (
                roles.map(role => (
                  <tr key={role.id} className="table-row">
                    <td className="px-6 py-4 font-medium" style={{ color: 'var(--text-main)' }}>{role.name}</td>
                    <td className="px-6 py-4 text-sm max-w-md truncate" style={{ color: 'var(--text-muted)' }}>{role.description || '—'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-medium border"
                            style={{ backgroundColor: 'var(--hover-bg)', color: 'var(--text-main)', borderColor: 'var(--border-color)' }}>
                        {role._count?.employees || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => handleAssign(role)}
                          title="Assign Employee"
                          className="p-2 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400"
                        >
                          <UserPlus size={18} />
                        </button>
                        <button 
                          onClick={() => handleEdit(role)}
                          title="Edit Role"
                          className="p-2 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(role)}
                          title="Delete Role"
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

      <RoleFormModal 
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={fetchRoles}
        role={selectedRole}
      />

      <AssignEmployeeToRoleModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSuccess={fetchRoles}
        role={selectedRole}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Role"
        message={`Are you sure you want to delete the ${selectedRole?.name} role? All employees in this role will be unassigned.`}
        verifyString="DELETE"
      />
    </div>
  );
}
