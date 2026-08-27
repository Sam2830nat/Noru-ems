import React, { useState, useEffect } from 'react';
import { X, Loader2, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Role, Employee } from '@/lib/types';

interface AssignEmployeeToRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  role?: Role;
}

export default function AssignEmployeeToRoleModal({ isOpen, onClose, onSuccess, role }: AssignEmployeeToRoleModalProps) {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      api.get('/employees', { params: { limit: 100 } })
         .then(res => setEmployees(res.data.data))
         .catch(console.error);
         
      setErrors({});
      setSelectedEmployeeId('');
    }
  }, [isOpen]);

  if (!isOpen || !role) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId) {
      setErrors({ employeeId: 'Please select an employee' });
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      await api.patch(`/employees/${selectedEmployeeId}`, { roleId: role.id });
      toast.success('Employee assigned to role!');
      onSuccess();
      onClose();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to assign employee.';
      toast.error(msg);
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
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <UserPlus size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>Assign Employee</h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>To {role.name}</p>
            </div>
          </div>
          <button onClick={onClose} disabled={loading} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <X size={20} />
          </button>
        </div>

        <form id="assign-role-employee-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Select Employee</label>
            <select 
              className="input" 
              value={selectedEmployeeId} 
              onChange={e => setSelectedEmployeeId(e.target.value)}
            >
              <option value="">Select an employee...</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.employeeNumber}) {emp.roleId === role.id ? '(Already in this role)' : ''}
                </option>
              ))}
            </select>
            {errors.employeeId && <span className="text-xs text-red-500 mt-1">{errors.employeeId}</span>}
          </div>
        </form>

        <div className="mt-6 flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <button type="button" onClick={onClose} disabled={loading} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" form="assign-role-employee-form" disabled={loading} className="btn-primary min-w-[120px] flex justify-center items-center gap-2">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Assign'}
          </button>
        </div>
      </div>
    </div>
  );
}
