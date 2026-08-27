import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  message: string;
  verifyString: string;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  verifyString
}: DeleteConfirmationModalProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setInput('');
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (input !== verifyString) return;
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Delete failed', error);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={!loading ? onClose : undefined} />
      <div className="relative glass-card w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>{title}</h3>
          </div>
          <button onClick={onClose} disabled={loading} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <X size={20} />
          </button>
        </div>

        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          {message}
        </p>

        <div className="mb-6">
          <label className="label">
            To confirm, type <span className="font-bold text-red-600 dark:text-red-400">"{verifyString}"</span> below:
          </label>
          <input
            type="text"
            className="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={verifyString}
            disabled={loading}
          />
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} disabled={loading} className="btn-secondary">
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            disabled={input !== verifyString || loading}
            className="btn-danger flex items-center justify-center min-w-[100px]"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirm Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
