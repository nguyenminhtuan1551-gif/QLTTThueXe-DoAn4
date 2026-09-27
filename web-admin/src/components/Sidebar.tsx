'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Car,
  FileText,
  FileCheck,
  AlertTriangle,
  ClipboardCheck,
  Wrench,
  BarChart3,
  Users,
  MessageSquare,
  UserCheck,
  Settings,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, isAdmin } = useAuth();
  const { isOpen, closeSidebar } = useSidebar();

  const navigation = [
    { name: 'Dashboard Tổng quan', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Quản lý Đội xe', href: '/cars', icon: Car },
    { name: 'Hợp đồng thuê xe', href: '/contracts', icon: FileText },
    { name: 'Trả xe & Quyết toán', href: '/returns', icon: FileCheck },
    { name: 'Biên bản Phí phạt', href: '/penalties', icon: AlertTriangle },
    { name: 'Hồ sơ Đăng kiểm', href: '/inspection', icon: ClipboardCheck },
    { name: 'Bảo trì & Sửa chữa', href: '/maintenance', icon: Wrench },
    { name: 'Báo cáo Doanh thu', href: '/reports', icon: BarChart3 },
    { name: 'Quản lý Khách hàng', href: '/customers', icon: Users },
    { name: 'Hộp thư Liên hệ', href: '/contacts', icon: MessageSquare },
    ...(isAdmin
      ? [{ name: 'Quản lý Nhân sự', href: '/employees', icon: UserCheck }]
      : []),
    { name: 'Cài đặt hệ thống', href: '/settings', icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-white w-64 border-r border-slate-800">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-lg text-white shadow-md">
            🚗
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight text-white">Car Rental</h1>
            <p className="text-[11px] text-slate-400 font-medium tracking-wide">PORTAL ADMIN</p>
          </div>
        </div>

        {/* Mobile Close Button */}
        <button
          onClick={closeSidebar}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={closeSidebar}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="text-[13px]">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Badge Info */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold border border-blue-500/30 shrink-0">
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.fullName || 'Admin'}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="text-[11px] font-medium text-slate-400">{user?.role || 'Quản trị viên'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex w-64 min-h-screen shrink-0">
        {sidebarContent}
      </aside>

      {/* 2. Mobile / Tablet Drawer & Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={closeSidebar}
          />

          {/* Sliding Drawer */}
          <div className="relative z-10 animate-in slide-in-from-left duration-200 shadow-2xl h-full">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
