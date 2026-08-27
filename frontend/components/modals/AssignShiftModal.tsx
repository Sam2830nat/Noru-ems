import React, { useState, useEffect } from 'react';
import { X, Loader2, Calendar } from 'lucide-react';
import api from '@/lib/api';
import { Employee, Shift } from '@/lib/types';
import { format } from 'date-fns';

interface AssignShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employee?: Employee;
}

export default function AssignShiftModal({ isOpen, onClose, onSuccess, employee }: AssignShiftModalProps) {
  const [loading, setLoading] = useState(false);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    shiftId: '',
    assignedDate: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    if (isOpen) {
      api.get('/shifts').then(res => setShifts(res.data.data)).catch(console.error);
      setErrors({});
      setFormData({
        shiftId: '',
        assignedDate: format(new Date(), 'yyyy-MM-dd')
      });
    }
  }, [isOpen]);

  if (!isOpen || !employee) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.shiftId) {
      setErrors({ shiftId: 'Please select a shift' });
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      await api.post(`/employees/${employee.id}/shifts`, formData);
      onSuccess();
      onClose();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const fieldErrors: Record<string, string> = {};
        error.response.data.errors.forEach((err: any) => {
          fieldErrors[err.field] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ general: error.response?.data?.message || 'Failed to assign shift.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={!loading ? onClose : undefined} />
      <div className="relative glass-card w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex items-start justify-between mb-5 border-b pb-4" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
              <Calendar size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>Assign Shift</h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{employee.firstName} {employee.lastName}</p>
            </div>
          </div>
          <button onClick={onClose} disabled={loading} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <X size={20} />
          </button>
        </div>

        {errors.general && (
          <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-sm">
            {errors.general}
          </div>
        )}

        <form id="assign-shift-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Date</label>
            <input 
              required 
              type="date" 
              className="input" 
              value={formData.assignedDate} 
              onChange={e => setFormData({...formData, assignedDate: e.target.value})} 
            />
            {errors.assignedDate && <span className="text-xs text-red-500 mt-1">{errors.assignedDate}</span>}
          </div>

          <div>
            <label className="label">Shift</label>
            <select 
              className="input" 
              value={formData.shiftId} 
              onChange={e => setFormData({...formData, shiftId: e.target.value})}
            >
              <option value="">Select a shift...</option>
              {shifts.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.startTime} - {s.endTime})
                </option>
              ))}
            </select>
            {errors.shiftId && <span className="text-xs text-red-500 mt-1">{errors.shiftId}</span>}
          </div>
        </form>

        <div className="mt-6 flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <button type="button" onClick={onClose} disabled={loading} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" form="assign-shift-form" disabled={loading} className="btn-primary min-w-[120px] flex justify-center items-center gap-2">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Assign Shift'}
          </button>
        </div>
      </div>
    </div>
  );
}
