import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Role } from '@/lib/types';

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  role?: Role;
}

export default function RoleFormModal({ isOpen, onClose, onSuccess, role }: RoleFormModalProps) {
  const isEdit = !!role;
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      if (role) {
        setFormData({
          name: role.name,
          description: role.description || ''
        });
      } else {
        setFormData({
          name: '',
          description: ''
        });
      }
    }
  }, [isOpen, role]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    
    try {
      if (isEdit) {
        await api.patch(`/roles/${role.id}`, formData);
        toast.success('Role updated successfully!');
      } else {
        await api.post('/roles', formData);
        toast.success('Role created successfully!');
      }
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
        const msg = error.response?.data?.message || 'Failed to save role.';
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={!loading ? onClose : undefined} />
      <div className="relative glass-card w-full max-w-lg flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>
            {isEdit ? 'Edit Role' : 'Add New Role'}
          </h2>
          <button onClick={onClose} disabled={loading} style={{ color: 'var(--text-muted)' }} className="hover:opacity-70 transition-opacity">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <form id="role-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Role Name</label>
              <input 
                required 
                type="text" 
                className="input" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
              />
              {errors.name && <span className="text-xs text-red-500 mt-1">{errors.name}</span>}
            </div>
            <div>
              <label className="label">Description (Optional)</label>
              <textarea 
                className="input min-h-[100px] resize-y" 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
              />
              {errors.description && <span className="text-xs text-red-500 mt-1">{errors.description}</span>}
            </div>
          </form>
        </div>

        <div className="p-6 border-t flex justify-end gap-3" style={{ borderColor: 'var(--border-color)' }}>
          <button type="button" onClick={onClose} disabled={loading} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" form="role-form" disabled={loading} className="btn-primary min-w-[120px] flex justify-center">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isEdit ? 'Save Changes' : 'Create Role')}
          </button>
        </div>
      </div>
    </div>
  );
}
