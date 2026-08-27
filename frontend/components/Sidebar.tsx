'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard, Users, Building2, Briefcase,
  Clock, CalendarCheck, BarChart3, LogOut, X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
}

export default function Sidebar({ isOpen, onClose, isCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const { logout, loading } = useAuth();

  if (loading) return null;

  const links = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Employees', href: '/employees', icon: Users },
    { name: 'Departments', href: '/departments', icon: Building2 },
    { name: 'Roles', href: '/roles', icon: Briefcase },
    { name: 'Shifts', href: '/shifts', icon: Clock },
    { name: 'Attendance', href: '/attendance', icon: CalendarCheck },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside 
        className={`
          fixed inset-y-0 left-0 border-r flex flex-col z-40 transition-all duration-300 ease-in-out lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ 
          width: isCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)'
        }}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight" style={{ color: 'var(--text-main)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/20"
                 style={{ backgroundColor: 'var(--btn-primary-bg)' }}>
              <span className="text-white text-lg">N</span>
            </div>
            {!isCollapsed && <span className="whitespace-nowrap">Noru EMS</span>}
          </div>
          <button onClick={onClose} className="lg:hidden" style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1.5 overflow-x-hidden">
          {!isCollapsed && (
            <div className="text-xs font-semibold uppercase tracking-wider mb-2 px-3" style={{ color: 'var(--text-muted)' }}>
              Menu
            </div>
          )}
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`sidebar-link ${isActive ? 'active' : ''} ${isCollapsed ? 'justify-center px-0' : ''}`}
                title={isCollapsed ? link.name : undefined}
              >
                <Icon size={18} className="shrink-0" style={{ color: isActive ? 'var(--btn-primary-bg)' : 'inherit' }} />
                {!isCollapsed && <span className="whitespace-nowrap">{link.name}</span>}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <button
            onClick={logout}
            className={`flex items-center gap-3 py-2.5 w-full rounded-lg text-sm font-medium transition-all ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}
            style={{ color: 'var(--text-muted)' }}
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut size={18} className="shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
