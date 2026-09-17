'use client';

import React from 'react';
import { LogOut, Bell, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  title: string;
  description?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, description }) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10 shadow-xs">
      <div>
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        {description && (
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
          <Shield className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-xs font-semibold text-slate-700">
            {user?.role === 'Admin' ? 'Quản trị viên cấp cao' : 'Nhân viên vận hành'}
          </span>
        </div>

        <button
          onClick={logout}
          title="Đăng xuất"
          className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </header>
  );
};
