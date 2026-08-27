'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import { useAuth } from '@/lib/auth-context';
import { Loader2, Menu, Moon, Sun } from 'lucide-react';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(false);
  
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  
  const isLoginPage = pathname === '/login';

  // Load theme preference on mount
  useEffect(() => {
    const isDarkStored = localStorage.getItem('theme') === 'dark';
    setIsDark(isDarkStored);
    if (isDarkStored) document.documentElement.classList.add('dark');
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setIsDark(!isDark);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)]">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!user) {
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)]">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-main)' }}>
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        isCollapsed={isCollapsed}
      />
      <main 
        className="flex-1 flex flex-col min-h-screen overflow-hidden transition-all duration-300 ease-in-out"
        style={{ marginLeft: isCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)' }}
      >
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b z-10 sticky top-0 backdrop-blur-md"
                style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)', opacity: 0.95 }}>
          <div className="flex items-center gap-4">
            {/* Mobile Toggle */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg"
              style={{ color: 'var(--text-muted)' }}
            >
              <Menu size={24} />
            </button>
            {/* Desktop Toggle */}
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:block p-2 -ml-2 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              style={{ color: 'var(--text-muted)' }}
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-semibold capitalize hidden sm:block" style={{ color: 'var(--text-main)' }}>
              {pathname === '/' ? 'Dashboard' : pathname.split('/')[1]}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              style={{ color: 'var(--text-muted)' }}
              title="Toggle Dark Mode"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>{user.name}</div>
              <div className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{user.role.toLowerCase()}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold">
              {user.name.charAt(0)}
            </div>
          </div>
        </header>
        <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
