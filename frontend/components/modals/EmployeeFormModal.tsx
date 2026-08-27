import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Employee, Department, Role } from '@/lib/types';
import { format } from 'date-fns';

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employee?: Employee;
}

export default function EmployeeFormModal({ isOpen, onClose, onSuccess, employee }: EmployeeFormModalProps) {
  const isEdit = !!employee;
  
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    hireDate: format(new Date(), 'yyyy-MM-dd'),
    departmentId: '',
    roleId: '',
    status: 'ACTIVE'
  });

  useEffect(() => {
    if (isOpen) {
      // Fetch dropdown data
      api.get('/departments').then(res => setDepartments(res.data.data)).catch(console.error);
      api.get('/roles').then(res => setRoles(res.data.data)).catch(console.error);
      
      setErrors({});
      if (employee) {
        setFormData({
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          phone: employee.phone || '',
          hireDate: format(new Date(employee.hireDate), 'yyyy-MM-dd'),
          departmentId: employee.departmentId || '',
          roleId: employee.roleId || '',
          status: employee.status
        });
      } else {
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          hireDate: format(new Date(), 'yyyy-MM-dd'),
          departmentId: '',
          roleId: '',
          status: 'ACTIVE'
        });
      }
    }
  }, [isOpen, employee]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    
    // Format payload
    const payload = {
      ...formData,
      departmentId: formData.departmentId || null,
      roleId: formData.roleId || null,
    };

    try {
      if (isEdit) {
        await api.patch(`/employees/${employee.id}`, payload);
        toast.success('Employee updated successfully!');
      } else {
        await api.post('/employees', payload);
        toast.success('Employee created successfully!');
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
        const msg = error.response?.data?.message || 'Something went wrong.';
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={!loading ? onClose : undefined} />
      <div className="relative glass-card w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>
            {isEdit ? 'Edit Employee' : 'Add New Employee'}
          </h2>
          <button onClick={onClose} disabled={loading} style={{ color: 'var(--text-muted)' }} className="hover:opacity-70 transition-opacity">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="employee-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                <input required type="text" className="input" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                {errors.firstName && <span className="text-xs text-red-500 mt-1">{errors.firstName}</span>}
              </div>
              <div>
                <label className="label">Last Name</label>
                <input required type="text" className="input" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                {errors.lastName && <span className="text-xs text-red-500 mt-1">{errors.lastName}</span>}
              </div>
              <div className="md:col-span-2">
                <label className="label">Email Address</label>
                <input required type="email" className="input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                {errors.email && <span className="text-xs text-red-500 mt-1">{errors.email}</span>}
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input type="text" className="input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                {errors.phone && <span className="text-xs text-red-500 mt-1">{errors.phone}</span>}
              </div>
              <div>
                <label className="label">Hire Date</label>
                <input required type="date" className="input" value={formData.hireDate} onChange={e => setFormData({...formData, hireDate: e.target.value})} />
                {errors.hireDate && <span className="text-xs text-red-500 mt-1">{errors.hireDate}</span>}
              </div>
              <div>
                <label className="label">Department</label>
                <select className="input" value={formData.departmentId} onChange={e => setFormData({...formData, departmentId: e.target.value})}>
                  <option value="">Select Department...</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                {errors.departmentId && <span className="text-xs text-red-500 mt-1">{errors.departmentId}</span>}
              </div>
              <div>
                <label className="label">Role</label>
                <select className="input" value={formData.roleId} onChange={e => setFormData({...formData, roleId: e.target.value})}>
                  <option value="">Select Role...</option>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                {errors.roleId && <span className="text-xs text-red-500 mt-1">{errors.roleId}</span>}
              </div>
              {isEdit && (
                <div className="md:col-span-2">
                  <label className="label">Status</label>
                  <select className="input" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              )}
            </div>
          </form>
        </div>

        <div className="p-6 border-t flex justify-end gap-3" style={{ borderColor: 'var(--border-color)' }}>
          <button type="button" onClick={onClose} disabled={loading} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" form="employee-form" disabled={loading} className="btn-primary min-w-[120px] flex justify-center">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isEdit ? 'Save Changes' : 'Create Employee')}
          </button>
        </div>
      </div>
    </div>
  );
}
