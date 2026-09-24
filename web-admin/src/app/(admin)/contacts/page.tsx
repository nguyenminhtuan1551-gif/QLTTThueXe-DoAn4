'use client';

import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Clock,
  Mail,
  Phone,
  User,
  Check,
} from 'lucide-react';
import { Header } from '../../../components/Header';
import { contactService } from '../../../services/contactService';
import { ContactMessage } from '../../../types';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await contactService.getContacts();
      if (response.success && response.data) {
        setContacts(response.data);
      }
    } catch (error: any) {
      showToast(error.message || 'Lỗi khi tải danh sách tin nhắn', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '--';
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) return dateStr.slice(0, 10);
    const d = String(parsed.getDate()).padStart(2, '0');
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const y = parsed.getFullYear();
    const hours = String(parsed.getHours()).padStart(2, '0');
    const mins = String(parsed.getMinutes()).padStart(2, '0');
    return `${hours}:${mins} - ${d}/${m}/${y}`;
  };

  const handleUpdateStatus = async (id: string | number, nextStatus: 'Mới' | 'Đã phản hồi') => {
    try {
      await contactService.updateContactStatus(id, nextStatus);
      showToast('Cập nhật trạng thái phản hồi tin nhắn thành công!');
      fetchContacts();
    } catch (err: any) {
      showToast(err.message || 'Không thể cập nhật trạng thái.', 'error');
    }
  };

  const totalCount = contacts.length;
  const newCount = contacts.filter((c) => c.status === 'Mới').length;
  const respondedCount = contacts.filter((c) => c.status === 'Đã phản hồi').length;

  const filteredContacts = contacts.filter((c) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = c.fullName?.toLowerCase().includes(q);
      const matchPhone = c.phone?.toLowerCase().includes(q);
      const matchEmail = c.email?.toLowerCase().includes(q);
      const matchMsg = c.message?.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchEmail && !matchMsg) return false;
    }

    if (statusFilter !== 'Tất cả' && c.status !== statusFilter) {
      return false;
    }

    return true;
  });

  return (
    <div className="flex-1 min-w-0">
      <Header
        title="Hộp Thư Liên Hệ & CSKH (Support Center)"
        description="Tiếp nhận ý kiến đóng góp, phản hồi chất lượng và các yêu cầu hỗ trợ khách hàng từ ứng dụng Mobile"
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

      <div className="p-8 space-y-6">
        {/* KPI Summary Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl border border-blue-100">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Tổng Tin Nhắn Hỗ Trợ</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{totalCount}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl border border-amber-100">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Chờ Phản Hồi (Mới)</p>
              <h3 className="text-2xl font-black text-amber-600 mt-0.5">{newCount}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl border border-emerald-100">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Đã Xử Lý / Phản Hồi</p>
              <h3 className="text-2xl font-black text-emerald-700 mt-0.5">{respondedCount}</h3>
            </div>
          </div>
        </div>

        {/* Filters and Actions Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-[320px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm tin nhắn theo tên người gửi, SĐT, nội dung..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg text-sm py-2 px-3 text-slate-700 focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="Tất cả">Tất cả tình trạng</option>
                <option value="Mới">Mới (Chưa phản hồi)</option>
                <option value="Đã phản hồi">Đã phản hồi</option>
              </select>
            </div>
          </div>

          <button
            onClick={fetchContacts}
            className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            title="Làm mới"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Contacts Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Mã</th>
                  <th className="px-5 py-3.5">Người Gửi</th>
                  <th className="px-5 py-3.5">Liên Lạc</th>
                  <th className="px-5 py-3.5">Nội Dung Tin Nhắn</th>
                  <th className="px-5 py-3.5">Thời Gian Gửi</th>
                  <th className="px-5 py-3.5">Tình Trạng</th>
                  <th className="px-5 py-3.5 text-right">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs">Đang tải tin nhắn liên hệ...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                      Chưa có tin nhắn liên hệ nào.
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-900 text-xs font-mono">
                        #{c.id}
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-900">
                        {c.fullName}
                      </td>
                      <td className="px-5 py-4 text-xs">
                        <p className="font-semibold text-slate-800">{c.phone}</p>
                        <p className="text-slate-400 mt-0.5">{c.email}</p>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-700 max-w-sm">
                        <p className="line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100" title={c.message}>
                          {c.message}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500 font-medium">
                        {formatDate(c.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        {c.status === 'Mới' ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Mới
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Đã phản hồi
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {c.status === 'Mới' ? (
                          <button
                            onClick={() => handleUpdateStatus(c.id, 'Đã phản hồi')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xs transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Đánh dấu xong</span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">Hoàn tất</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
