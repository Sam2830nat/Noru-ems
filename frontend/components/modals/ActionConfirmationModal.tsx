import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertTriangle } from 'lucide-react';

interface ActionConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  message: string;
  verifyString: string;
  actionButtonText?: string;
  isDestructive?: boolean;
}

export default function ActionConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  verifyString,
  actionButtonText = 'Confirm',
  isDestructive = false
}: ActionConfirmationModalProps) {
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
    await onConfirm();
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={!loading ? onClose : undefined} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full flex-shrink-0 ${isDestructive ? 'bg-red-500/20 text-red-500' : 'bg-indigo-500/20 text-indigo-500'}`}>
            <AlertTriangle size={24} />
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold text-white">{title}</h3>
              <button onClick={onClose} disabled={loading} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <p className="text-slate-300 mt-2 text-sm leading-relaxed">
              {message}
            </p>

            <div className="mt-4">
              <label className="block text-xs text-slate-400 mb-2 font-medium">
                Type <span className="font-bold text-white tracking-wider">{verifyString}</span> to confirm
              </label>
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={verifyString}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button 
            onClick={onClose} 
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            disabled={input !== verifyString || loading}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white shadow-lg transition-all min-w-[100px] flex justify-center items-center ${
              input === verifyString 
                ? isDestructive 
                  ? 'bg-red-600 hover:bg-red-500 hover:shadow-red-500/25'
                  : 'bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/25'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : actionButtonText}
          </button>
        </div>

      </div>
    </div>
  );
}
