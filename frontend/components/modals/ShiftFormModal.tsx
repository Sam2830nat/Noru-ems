import React, { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  description?: string | null;
  isOvernight?: boolean;
}

interface ShiftFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  shift?: Shift;
}

export default function ShiftFormModal({ isOpen, onClose, onSuccess, shift }: ShiftFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    startTime: '09:00',
    endTime: '17:00',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (shift) {
        setFormData({
          name: shift.name,
          startTime: shift.startTime,
          endTime: shift.endTime,
          description: shift.description || '',
        });
      } else {
        setFormData({
          name: '',
          startTime: '09:00',
          endTime: '17:00',
          description: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, shift]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (!formData.name.trim()) {
      setErrors({ name: 'Shift name is required' });
      return;
    }

    setLoading(true);
    try {
      if (shift) {
        await api.patch(`/shifts/${shift.id}`, formData);
        toast.success('Shift updated successfully');
      } else {
        await api.post('/shifts', formData);
        toast.success('Shift created successfully');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      if (error.response?.data?.errors?.length > 0) {
        const fieldErrors: Record<string, string> = {};
        error.response.data.errors.forEach((err: any) => {
          fieldErrors[err.field] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        toast.error(error.response?.data?.message || 'Failed to save shift');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={!loading ? onClose : undefined} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">{shift ? 'Edit Shift' : 'Create Shift'}</h3>
          <button onClick={onClose} disabled={loading} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Shift Name <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              className="input" 
              placeholder="e.g. Morning Shift"
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
            {errors.name && <span className="text-xs text-red-500 mt-1">{errors.name}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Time <span className="text-red-500">*</span></label>
              <input 
                type="time" 
                className="input" 
                value={formData.startTime} 
                onChange={e => setFormData({...formData, startTime: e.target.value})}
              />
              {errors.startTime && <span className="text-xs text-red-500 mt-1">{errors.startTime}</span>}
            </div>
            <div>
              <label className="label">End Time <span className="text-red-500">*</span></label>
              <input 
                type="time" 
                className="input" 
                value={formData.endTime} 
                onChange={e => setFormData({...formData, endTime: e.target.value})}
              />
              {errors.endTime && <span className="text-xs text-red-500 mt-1">{errors.endTime}</span>}
            </div>
          </div>
          
          <div className="text-xs text-slate-400 italic">
            Note: If the end time is earlier than the start time, the shift will automatically be marked as an overnight shift.
          </div>

          <div>
            <label className="label">Description</label>
            <textarea 
              className="input resize-none" 
              rows={3}
              placeholder="Brief description of the shift..."
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button 
              type="button"
              onClick={onClose} 
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white shadow-lg bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/25 transition-all min-w-[100px] flex justify-center items-center"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : shift ? 'Update Shift' : 'Create Shift'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
