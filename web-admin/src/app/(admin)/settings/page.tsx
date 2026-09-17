'use client';

import React from 'react';
import { Header } from '../../../components/Header';
import { Settings, Bell, Shield, Phone, Mail, MapPin } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="flex-1 min-w-0">
      <Header
        title="Cài Đặt Hệ Thống"
        description="Thông tin cấu hình doanh nghiệp, chính sách cảnh báo đăng kiểm và liên hệ hỗ trợ"
      />

      <div className="p-8 max-w-4xl space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Thông Tin Doanh Nghiệp</h3>
              <p className="text-xs text-slate-500">Thông tin hiển thị trên hợp đồng và ứng dụng</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-xs text-slate-400 font-medium">Tên Doanh Nghiệp</p>
              <p className="text-sm font-bold text-slate-800 mt-1">Hệ Thống Cho Thuê Xe Tự Lái Car Rental</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-xs text-slate-400 font-medium">Hotline Hỗ Trợ 24/7</p>
              <p className="text-sm font-bold text-blue-600 mt-1">1900 6868 - 0912 345 678</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-xs text-slate-400 font-medium">Email Điều Hành</p>
              <p className="text-sm font-bold text-slate-800 mt-1">support@thuexetudong.vn</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-xs text-slate-400 font-medium">Phạm Vi Phục Vụ</p>
              <p className="text-sm font-bold text-emerald-700 mt-1">Toàn bộ địa bàn Thành phố Hà Nội</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Cấu Hình Cảnh Báo Tự Động</h3>
              <p className="text-xs text-slate-500">Ngưỡng nhắc nhở và thông báo định kỳ</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
              <div>
                <p className="font-semibold text-slate-800">Cảnh báo hạn đăng kiểm xe</p>
                <p className="text-xs text-slate-500">Tự động gắn nhãn "Sắp hết hạn" trước 30 ngày</p>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Đang bật
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
              <div>
                <p className="font-semibold text-slate-800">Cảnh báo bảo trì định kỳ</p>
                <p className="text-xs text-slate-500">Nhắc nhở kiểm tra định kỳ sau mỗi hợp đồng thuê kết thúc</p>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Đang bật
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
