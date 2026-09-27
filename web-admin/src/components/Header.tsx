'use client';

import React from 'react';
import { LogOut, Shield, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';

interface HeaderProps {
  title: string;
  description?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, description }) => {
  const { user, logout } = useAuth();
  const { toggleSidebar } = useSidebar();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile / Tablet Hamburger Toggle */}
        <button
          onClick={toggleSidebar}
          aria-label="Mở menu"
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h2 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 truncate">
            {title}
          </h2>
          {description && (
            <p className="text-[11px] sm:text-xs text-slate-500 truncate hidden sm:block mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-100 px-2.5 sm:px-3 py-1.5 rounded-full border border-slate-200">
          <Shield className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="text-[11px] sm:text-xs font-semibold text-slate-700">
            <span className="hidden sm:inline">
              {user?.role === 'Admin' ? 'Quản trị viên cấp cao' : 'Nhân viên vận hành'}
            </span>
            <span className="sm:hidden">
              {user?.role === 'Admin' ? 'Admin' : 'Nhân viên'}
            </span>
          </span>
        </div>

        <button
          onClick={logout}
          title="Đăng xuất"
          className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 sm:px-3 py-1.5 rounded-lg border border-red-200 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Đăng xuất</span>
        </button>
      </div>
    </header>
  );
};
