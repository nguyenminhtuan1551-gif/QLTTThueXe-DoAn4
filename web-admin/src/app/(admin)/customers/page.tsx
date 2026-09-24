'use client';

import React, { useEffect, useState } from 'react';
import {
  Search,
  RefreshCw,
  Eye,
  User,
  Phone,
  Mail,
  CreditCard,
  MapPin,
  Calendar,
  X,
  History,
  Car as CarIcon,
} from 'lucide-react';
import { Header } from '../../../components/Header';
import { Badge } from '../../../components/Badge';
import { customerService } from '../../../services/customerService';
import { Customer, Contract } from '../../../types';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Customer Detail & History Modal State
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [rentals, setRentals] = useState<Contract[]>([]);
  const [loadingRentals, setLoadingRentals] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

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

  const handleOpenDetailModal = async (cust: Customer) => {
    setSelectedCustomer(cust);
    setModalOpen(true);
    setLoadingRentals(true);
    try {
      const response = await customerService.getCustomerRentals(cust.id);
      if (response.success && response.data) {
        setRentals(response.data);
      } else {
        setRentals([]);
      }
    } catch (err: any) {
      console.warn('Lỗi tải lịch sử đơn thuê của khách:', err);
      setRentals([]);
    } finally {
      setLoadingRentals(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(val || 0);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '--';
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) return dateStr.slice(0, 10);
    const d = String(parsed.getDate()).padStart(2, '0');
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const y = parsed.getFullYear();
    return `${d}/${m}/${y}`;
  };

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
        title="Quản Lý Khách Hàng (Customer Management)"
        description="Quản lý hồ sơ thông tin khách hàng, số CCCD/GPLX, danh bạ liên lạc và lịch sử toàn bộ các chuyến thuê xe"
      />

      <div className="p-8 space-y-6">
        {/* Search Bar */}
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
            className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Mã KH</th>
                  <th className="px-5 py-3.5">Họ & Tên</th>
                  <th className="px-5 py-3.5">Thông Tin Liên Hệ</th>
                  <th className="px-5 py-3.5">CCCD / CMND</th>
                  <th className="px-5 py-3.5">Số GPLX</th>
                  <th className="px-5 py-3.5">Địa Chỉ Thường Trú</th>
                  <th className="px-5 py-3.5 text-right">Lịch Sử Thuê</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs">Đang tải danh sách khách hàng...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                      Không tìm thấy khách hàng nào.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-900 text-xs font-mono">
                        {c.id}
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-900">
                        {c.fullName}
                      </td>
                      <td className="px-5 py-4 text-xs">
                        <p className="font-semibold text-slate-800">{c.phone}</p>
                        <p className="text-slate-400 mt-0.5">{c.email}</p>
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
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleOpenDetailModal(c)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 border border-blue-200 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Chi tiết & Lịch sử</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Chi tiết Khách Hàng & Lịch Sử Thuê Xe */}
      {modalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                  {selectedCustomer.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedCustomer.fullName}</h3>
                  <p className="text-xs text-slate-500">Mã KH: {selectedCustomer.id}</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Profile Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400">Số Điện Thoại:</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedCustomer.phone}</p>
                </div>
                <div>
                  <span className="text-slate-400">Email:</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedCustomer.email || '—'}</p>
                </div>
                <div>
                  <span className="text-slate-400">Số CCCD / CMND:</span>
                  <p className="font-mono font-bold text-slate-800 mt-0.5">{selectedCustomer.cccd || '—'}</p>
                </div>
                <div>
                  <span className="text-slate-400">Số GPLX (Bằng lái):</span>
                  <p className="font-mono font-bold text-slate-800 mt-0.5">{selectedCustomer.driverLicense || '—'}</p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400">Địa Chỉ Cư Trú:</span>
                  <p className="font-medium text-slate-800 mt-0.5">{selectedCustomer.address || '—'}</p>
                </div>
              </div>

              {/* Rental History Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <History className="w-4 h-4 text-blue-600" />
                    <span>Lịch Sử Toàn Bộ Các Hợp Đồng Thuê Xe ({rentals.length})</span>
                  </h4>
                </div>

                {loadingRentals ? (
                  <div className="p-8 text-center text-slate-400">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span className="text-xs">Đang tải lịch sử thuê xe...</span>
                  </div>
                ) : rentals.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl text-xs">
                    Khách hàng này chưa có hợp đồng thuê xe nào trong hệ thống.
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase">
                        <tr>
                          <th className="px-4 py-2.5">Mã HĐ</th>
                          <th className="px-4 py-2.5">Xe Thuê</th>
                          <th className="px-4 py-2.5">Thời Gian</th>
                          <th className="px-4 py-2.5">Tổng Tiền</th>
                          <th className="px-4 py-2.5">Trạng Thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {rentals.map((r) => (
                          <tr key={r.id} className="hover:bg-slate-50/60">
                            <td className="px-4 py-3 font-mono font-bold text-blue-600">{r.id}</td>
                            <td className="px-4 py-3">
                              <p className="font-semibold text-slate-800">{r.carName || r.carId}</p>
                              <span className="font-mono text-[10px] text-slate-400">{r.carLicensePlate || r.carPlate}</span>
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {formatDate(r.startDate)} ➔ {formatDate(r.expectedReturnDate)}
                            </td>
                            <td className="px-4 py-3 font-bold text-slate-900">
                              {formatCurrency(r.totalAmount)}
                            </td>
                            <td className="px-4 py-3">
                              <Badge label={r.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
