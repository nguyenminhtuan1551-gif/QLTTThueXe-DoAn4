'use client';

import React, { useEffect, useState } from 'react';
import { Search, RefreshCw, Users } from 'lucide-react';
import { Header } from '../../../components/Header';
import { customerService } from '../../../services/customerService';
import { Customer } from '../../../types';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await customerService.getCustomers();
      if (response.success && response.data) {
        setCustomers(response.data);
      }
    } catch (error) {
      console.warn('Lỗi tải danh sách khách hàng:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filtered = customers.filter((c) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = c.fullName?.toLowerCase().includes(q);
      const matchPhone = c.phone?.toLowerCase().includes(q);
      const matchEmail = c.email?.toLowerCase().includes(q);
      const matchCccd = c.cccd?.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchEmail && !matchCccd) return false;
    }
    return true;
  });

  return (
    <div className="flex-1 min-w-0">
      <Header
        title="Danh Sách Khách Hàng"
        description="Quản lý hồ sơ khách hàng đã đăng ký tài khoản và thông tin giấy tờ định danh"
      />

      <div className="p-8 space-y-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm khách hàng theo tên, SĐT, CCCD, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <button
            onClick={fetchCustomers}
            className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            title="Làm mới"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Mã KH</th>
                  <th className="px-5 py-3.5">Họ & Tên</th>
                  <th className="px-5 py-3.5">Liên Hệ</th>
                  <th className="px-5 py-3.5">CCCD / CMND</th>
                  <th className="px-5 py-3.5">Số GPLX</th>
                  <th className="px-5 py-3.5">Địa Chỉ Cư Trú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs">Đang tải danh sách khách hàng...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                      Không tìm thấy khách hàng nào.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-900 text-xs">
                        {c.id}
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-900">
                        {c.fullName}
                      </td>
                      <td className="px-5 py-4 text-xs">
                        <p className="font-semibold text-slate-800">{c.phone}</p>
                        <p className="text-slate-400">{c.email}</p>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-slate-700">
                        {c.cccd || '—'}
                      </td>
                      <td className="px-5 py-4 text-xs font-medium text-slate-700">
                        {c.driverLicense || '—'}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500 max-w-[200px] truncate" title={c.address}>
                        {c.address || '—'}
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
