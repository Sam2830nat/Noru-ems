'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Shift } from '@/lib/types';
import { Plus, Edit, Trash2, Moon, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import ShiftFormModal from '@/components/modals/ShiftFormModal';
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal';

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | undefined>(undefined);

  const fetchShifts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/shifts');
      setShifts(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const handleCreate = () => {
    setSelectedShift(undefined);
    setIsFormModalOpen(true);
  };

  const handleEdit = (shift: Shift) => {
    setSelectedShift(shift);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (shift: Shift) => {
    setSelectedShift(shift);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedShift) return;
    try {
      const res = await api.delete(`/shifts/${selectedShift.id}`);
      toast.success(res.data?.message || 'Shift deleted successfully');
      fetchShifts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete shift');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--text-main)' }}>Manage Shifts</h2>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              className="input pl-9"
              placeholder="Search shifts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button onClick={handleCreate} className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto">
            <Plus size={18} /> Add Shift
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--hover-bg)' }}>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Shift Name</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Time</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Description</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-right" style={{ color: 'var(--text-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center" style={{ color: 'var(--text-muted)' }}>Loading...</td></tr>
              ) : shifts.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.description?.toLowerCase().includes(search.toLowerCase())).length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center" style={{ color: 'var(--text-muted)' }}>No shifts found.</td></tr>
              ) : (
                shifts
                  .filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.description?.toLowerCase().includes(search.toLowerCase()))
                  .map(shift => (
                  <tr key={shift.id} className="table-row">
                    <td className="px-6 py-4 font-medium" style={{ color: 'var(--text-main)' }}>{shift.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-main)' }}>
                        {shift.startTime} &mdash; {shift.endTime}
                        {shift.isOvernight && (
                          <span className="badge bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                            <Moon size={12} /> Overnight
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm max-w-md truncate" style={{ color: 'var(--text-muted)' }}>{shift.description || '—'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => handleEdit(shift)}
                          title="Edit Shift"
                          className="p-2 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(shift)}
                          title="Delete Shift"
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

      <ShiftFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={fetchShifts}
        shift={selectedShift}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Shift"
        message={`Are you sure you want to delete the ${selectedShift?.name} shift? This will permanently erase it.`}
        verifyString="DELETE"
      />
    </div>
  );
}
