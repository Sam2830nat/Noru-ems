import React, { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Attendance, Employee } from '@/lib/types';
import { format } from 'date-fns';

interface RecordAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  attendance?: Attendance;
  employees: Employee[]; // To populate the dropdown if creating new
}

export default function RecordAttendanceModal({ isOpen, onClose, onSuccess, attendance, employees }: RecordAttendanceModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    workDate: format(new Date(), 'yyyy-MM-dd'),
    status: 'PRESENT',
    checkIn: '',
    checkOut: '',
    notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      if (attendance) {
        setFormData({
          employeeId: attendance.employeeId,
          workDate: format(new Date(attendance.workDate), 'yyyy-MM-dd'),
          status: attendance.status,
          checkIn: attendance.checkIn ? format(new Date(attendance.checkIn), 'HH:mm') : '',
          checkOut: attendance.checkOut ? format(new Date(attendance.checkOut), 'HH:mm') : '',
          notes: attendance.notes || '',
        });
      } else {
        setFormData({
          employeeId: employees.length > 0 ? employees[0].id : '',
          workDate: format(new Date(), 'yyyy-MM-dd'),
          status: 'PRESENT',
          checkIn: '09:00',
          checkOut: '17:00',
          notes: '',
        });
      }
    }
  }, [isOpen, attendance, employees]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeeId) {
      toast.error('Please select an employee');
      return;
    }
    setLoading(true);
    try {
      // API expects datetime for checkIn/checkOut. Let's construct it.
      const payload: any = {
        employeeId: formData.employeeId,
        workDate: new Date(formData.workDate).toISOString(),
        status: formData.status,
        notes: formData.notes,
      };

      if (formData.checkIn) {
        const [inH, inM] = formData.checkIn.split(':');
        const inDate = new Date(formData.workDate);
        inDate.setHours(parseInt(inH), parseInt(inM), 0);
        payload.checkIn = inDate.toISOString();
      }

      if (formData.checkOut) {
        const [outH, outM] = formData.checkOut.split(':');
        const outDate = new Date(formData.workDate);
        outDate.setHours(parseInt(outH), parseInt(outM), 0);
        payload.checkOut = outDate.toISOString();
      }

      if (attendance) {
        await api.patch(`/attendance/${attendance.id}`, payload);
        toast.success('Attendance updated successfully');
      } else {
        await api.post('/attendance', payload);
        toast.success('Attendance recorded successfully');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={!loading ? onClose : undefined} />
      <div className="relative bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>
            {attendance ? 'Edit Attendance' : 'Record Attendance'}
          </h3>
          <button onClick={onClose} disabled={loading} className="text-slate-400 hover:text-[var(--text-main)] transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!attendance && (
            <div>
              <label className="label">Employee</label>
              <select 
                className="input" 
                value={formData.employeeId} 
                onChange={e => setFormData({...formData, employeeId: e.target.value})}
                disabled={!!attendance}
              >
                <option value="">Select Employee...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="label">Date</label>
            <input 
              type="date" 
              className="input" 
              value={formData.workDate} 
              onChange={e => setFormData({...formData, workDate: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="label">Status</label>
            <select 
              className="input" 
              value={formData.status} 
              onChange={e => setFormData({...formData, status: e.target.value})}
            >
              <option value="PRESENT">Present</option>
              <option value="ABSENT">Absent</option>
              <option value="LATE">Late</option>
              <option value="EXCUSED">Excused</option>
            </select>
          </div>

          {(formData.status === 'PRESENT' || formData.status === 'LATE') && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Check In</label>
                <input 
                  type="time" 
                  className="input" 
                  value={formData.checkIn} 
                  onChange={e => setFormData({...formData, checkIn: e.target.value})}
                />
              </div>
              <div>
                <label className="label">Check Out</label>
                <input 
                  type="time" 
                  className="input" 
                  value={formData.checkOut} 
                  onChange={e => setFormData({...formData, checkOut: e.target.value})}
                />
              </div>
            </div>
          )}

          <div>
            <label className="label">Notes</label>
            <textarea 
              className="input resize-none" 
              rows={2}
              placeholder="Any relevant notes..."
              value={formData.notes} 
              onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <button 
              type="button"
              onClick={onClose} 
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="btn-primary min-w-[100px] flex justify-center items-center"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
