'use client';

import React, { useEffect, useState } from 'react';
import {
  Settings,
  Bell,
  Building2,
  Phone,
  Mail,
  MapPin,
  Save,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Header } from '../../../components/Header';
import { settingsService } from '../../../services/settingsService';
import { SystemSettings } from '../../../types';
import { useAuth } from '../../../context/AuthContext';

export default function SettingsPage() {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState<SystemSettings>({
    companyName: 'Hệ Thống Cho Thuê Xe Tự Lái & Có Tài Hà Nội',
    phone: '1900 6868 - 0912 345 678',
    email: 'support@thuexetudong.vn',
    address: 'Số 10 Phạm Hùng, Phường Mễ Trì, Quận Nam Từ Liêm, Hà Nội',
    notifEmail: true,
    notifExpiry: true,
    notifContract: true,
    daysWarning: 30,
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await settingsService.getSettings();
      if (response.success && response.data) {
        setFormData({
          companyName: response.data.companyName || '',
          phone: response.data.phone || '',
          email: response.data.email || '',
          address: response.data.address || '',
          notifEmail: response.data.notifEmail ?? true,
          notifExpiry: response.data.notifExpiry ?? true,
          notifContract: response.data.notifContract ?? true,
          daysWarning: Number(response.data.daysWarning) || 30,
        });
      }
    } catch (error: any) {
      console.warn('Lỗi tải cài đặt:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName.trim() || !formData.phone.trim() || !formData.email.trim() || !formData.address.trim()) {
      showToast('Vui lòng điền đầy đủ các thông tin công ty.', 'error');
      return;
    }

    setSaving(true);
    try {
      await settingsService.updateSettings(formData);
      showToast('Cập nhật cấu hình hệ thống thành công!');
    } catch (error: any) {
      showToast(error.message || 'Lỗi khi lưu cài đặt.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 min-w-0">
      <Header
        title="Cài Đặt Hệ Thống (System Settings)"
        description="Thông tin cấu hình doanh nghiệp, chính sách cảnh báo đăng kiểm định kỳ và liên hệ hỗ trợ khách hàng"
      />

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-emerald-500/10'
              : 'bg-red-50 text-red-800 border-red-200 shadow-red-500/10'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="p-8 max-w-4xl space-y-6">
        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span className="text-xs">Đang tải cấu hình hệ thống...</span>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* Company Info Box */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Thông Tin Doanh Nghiệp</h3>
                    <p className="text-xs text-slate-500">
                      Hiển thị trên hợp đồng thuê xe, hoá đơn và ứng dụng khách hàng
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={fetchSettings}
                  className="p-1.5 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                  title="Tải lại cài đặt"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Tên Doanh Nghiệp / Trung Tâm Cho Thuê <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Hotline Hỗ Trợ 24/7 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Điều Hành / CSKH <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Địa Chỉ Trụ Sở Tại Hà Nội <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Notification and Warning Rules */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Cấu Hình Cảnh Báo & Tự Động Hóa</h3>
                  <p className="text-xs text-slate-500">
                    Ngưỡng thời gian cảnh báo trước hạn kiểm định và thông báo hợp đồng
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">
                      Số Ngày Cảnh Báo Đăng Kiểm Trước Hạn
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Hệ thống tự động gắn nhãn "Sắp hết hạn" cho xe khi còn ít hơn số ngày này
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={7}
                      max={90}
                      value={formData.daysWarning}
                      onChange={(e) =>
                        setFormData({ ...formData, daysWarning: Number(e.target.value) })
                      }
                      className="w-24 px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-800 text-center font-bold focus:outline-none focus:border-blue-500 bg-white"
                    />
                    <span className="text-xs text-slate-600 font-semibold">ngày</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">Gửi Thông Báo Qua Email</p>
                    <p className="text-xs text-slate-500">
                      Tự động gửi email thông báo khi có đơn đặt xe mới hoặc xe cần kiểm định
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.notifEmail ?? true}
                    onChange={(e) => setFormData({ ...formData, notifEmail: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">Cảnh Báo Đăng Kiểm Quá Hạn</p>
                    <p className="text-xs text-slate-500">
                      Tự động chặn tính năng đặt thuê trên ứng dụng nếu xe quá hạn kiểm định
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.notifExpiry ?? true}
                    onChange={(e) => setFormData({ ...formData, notifExpiry: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-blue-600/20 transition-all"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang lưu cấu hình...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Lưu Cài Đặt Hệ Thống</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
