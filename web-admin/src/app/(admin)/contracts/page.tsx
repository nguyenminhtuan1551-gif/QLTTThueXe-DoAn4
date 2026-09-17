'use client';

import React, { useEffect, useState } from 'react';
import { Search, Filter, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { Header } from '../../../components/Header';
import { Badge } from '../../../components/Badge';
import { contractService } from '../../../services/contractService';
import { Contract } from '../../../types';

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const response = await contractService.getContracts();
      if (response.success && response.data) {
        setContracts(response.data);
      }
    } catch (error) {
      console.warn('Lỗi tải danh sách hợp đồng:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: any) => {
    try {
      await contractService.updateContract(id, { status: newStatus });
      fetchContracts();
    } catch (err: any) {
      alert(err.message || 'Không thể cập nhật trạng thái hợp đồng.');
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(val || 0);
  };

  const filtered = contracts.filter((c) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchId = c.id?.toLowerCase().includes(q);
      const matchCust = c.customerName?.toLowerCase().includes(q);
      const matchCar = c.carName?.toLowerCase().includes(q);
      const matchPlate = c.carLicensePlate?.toLowerCase().includes(q);
      if (!matchId && !matchCust && !matchCar && !matchPlate) return false;
    }

    if (statusFilter !== 'Tất cả' && c.status !== statusFilter) {
      return false;
    }

    return true;
  });

  return (
    <div className="flex-1 min-w-0">
      <Header
        title="Quản Lý Hợp Đồng Thuê Xe"
        description="Theo dõi tiến độ hợp đồng, kiểm duyệt đơn đặt xe trực tuyến từ khách hàng và quản lý biên bản trả xe"
      />

      <div className="p-8 space-y-6">
        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-[280px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm hợp đồng theo mã HĐ, tên khách, biển số..."
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
                className="bg-slate-50 border border-slate-200 rounded-lg text-sm py-2 px-3 text-slate-700 focus:outline-none focus:border-blue-500"
              >
                <option value="Tất cả">Tất cả trạng thái</option>
                <option value="Chờ xác nhận">Chờ xác nhận</option>
                <option value="Đang hiệu lực">Đang hiệu lực</option>
                <option value="Đã hoàn thành">Đã hoàn thành</option>
                <option value="Đã hủy">Đã hủy</option>
              </select>
            </div>
          </div>

          <button
            onClick={fetchContracts}
            className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            title="Làm mới"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Contracts Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Mã HĐ</th>
                  <th className="px-5 py-3.5">Khách Hàng</th>
                  <th className="px-5 py-3.5">Phương Tiện</th>
                  <th className="px-5 py-3.5">Thời Gian & Điểm Đón</th>
                  <th className="px-5 py-3.5">Chi Phí</th>
                  <th className="px-5 py-3.5">Trạng Thái</th>
                  <th className="px-5 py-3.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs">Đang tải danh sách hợp đồng...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                      Không tìm thấy hợp đồng nào.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4 font-bold text-blue-600 text-xs">
                        {c.id}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-900">{c.customerName || c.customerId}</p>
                        <p className="text-xs text-slate-400">{c.customerPhone}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">{c.carName || c.carId}</p>
                        <p className="text-xs font-mono text-slate-400">{c.carLicensePlate}</p>
                      </td>
                      <td className="px-5 py-4 text-xs">
                        <p className="text-slate-800 font-medium">
                          {c.startDate?.slice(0, 10)} → {c.expectedReturnDate?.slice(0, 10)}
                        </p>
                        <p className="text-slate-400 truncate max-w-[200px] mt-0.5" title={c.pickupPoint}>
                          📍 {c.pickupPoint}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-xs">
                        <p className="font-bold text-slate-900 text-sm">{formatCurrency(c.totalAmount)}</p>
                        <p className="text-amber-600 font-semibold">Cọc: {formatCurrency(c.deposit)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <Badge label={c.status} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        {c.status === 'Chờ xác nhận' && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleUpdateStatus(c.id, 'Đang hiệu lực')}
                              className="px-2.5 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-xs font-semibold"
                            >
                              Duyệt
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(c.id, 'Đã hủy')}
                              className="px-2.5 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded text-xs font-semibold"
                            >
                              Hủy
                            </button>
                          </div>
                        )}
                        {c.status === 'Đang hiệu lực' && (
                          <button
                            onClick={() => handleUpdateStatus(c.id, 'Đã hoàn thành')}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-xs font-semibold"
                          >
                            Xác nhận trả xe
                          </button>
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
