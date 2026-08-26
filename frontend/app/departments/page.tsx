'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Department } from '@/lib/types';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDepartments = async () => {
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

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this department? Employees will be unassigned.')) return;
    try {
      await api.delete(`/departments/${id}`);
      fetchDepartments();
    } catch (err) {
      console.error(err);
      alert('Failed to delete department');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Manage Departments</h2>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Department
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-700">
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">Employees</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500">Loading...</td></tr>
              ) : departments.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500">No departments found.</td></tr>
              ) : (
                departments.map(dept => (
                  <tr key={dept.id} className="table-row">
                    <td className="px-6 py-4 font-medium text-white">{dept.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-400 max-w-md truncate">{dept.description || '—'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-800 text-xs font-medium text-slate-300 border border-slate-700">
                        {dept._count?.employees || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors">
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(dept.id)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
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
    </div>
  );
}
