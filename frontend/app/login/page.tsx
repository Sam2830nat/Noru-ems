'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Loader2, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@norubooking.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=2689&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-0" />
      
      <div className="z-10 w-full max-w-md p-8 glass-card border border-slate-700 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        
        <div className="mb-8 text-center">
          <div className="mx-auto w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30 mb-4 transform -rotate-3">
            <span className="text-white text-3xl font-bold">N</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Noru Booking</h1>
          <p className="text-slate-400 text-sm">Hotel Employee Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm font-medium text-center">
              {error}
            </div>
          )}
          
          <div className="space-y-1.5">
            <label className="label">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input pl-10 bg-slate-900/50 backdrop-blur-md"
                placeholder="admin@norubooking.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="label">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pl-10 bg-slate-900/50 backdrop-blur-md"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-2.5 mt-2 flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-8 text-center text-xs text-slate-500">
          <p>Demo Credentials:</p>
          <p>admin@norubooking.com / admin123</p>
        </div>
      </div>
    </div>
  );
}
