'use client';

import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  Eye,
  Trash2,
  AlertTriangle,
  DollarSign,
  CheckCircle,
  AlertCircle,
  X,
  FileCheck,
  Calendar,
  Car as CarIcon,
} from 'lucide-react';
import { Header } from '../../../components/Header';
import { penaltyService } from '../../../services/penaltyService';
import { returnService } from '../../../services/returnService';
import { PenaltyRecord, ReturnRecord } from '../../../types';
import { useAuth } from '../../../context/AuthContext';

export default function PenaltiesPage() {
  const { isAdmin } = useAuth();
  const [penalties, setPenalties] = useState<PenaltyRecord[]>([]);
  const [returns, setReturns] = useState<ReturnRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('Tất cả');

  // Detail Modal State
  const [selectedPenalty, setSelectedPenalty] = useState<PenaltyRecord | null>(null);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [penaltiesRes, returnsRes] = await Promise.all([
        penaltyService.getPenalties(),
        returnService.getReturns(),
      ]);

      if (penaltiesRes.success && penaltiesRes.data) {
        setPenalties(penaltiesRes.data);
      }
      if (returnsRes.success && returnsRes.data) {
        setReturns(returnsRes.data);
      }
    } catch (error: any) {
      showToast(error.message || 'Lỗi khi tải danh sách phí phạt', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const totalPenaltiesAmount = penalties.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const filteredPenalties = penalties.filter((p) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchId = p.id?.toLowerCase().includes(q);
      const matchReturn = p.returnId?.toLowerCase().includes(q);
      const matchCust = p.customerName?.toLowerCase().includes(q);
      const matchCar = (p as any).carName?.toLowerCase().includes(q);
      const matchPlate = (p as any).carPlate?.toLowerCase().includes(q);
      const matchType = p.type?.toLowerCase().includes(q);
      const matchNote = p.notes?.toLowerCase().includes(q);
      if (!matchId && !matchReturn && !matchCust && !matchCar && !matchPlate && !matchType && !matchNote) return false;
    }

    if (typeFilter !== 'Tất cả' && p.type !== typeFilter) {
      return false;
    }

    return true;
  });

  const handleDeletePenalty = async (p: PenaltyRecord) => {
    if (!isAdmin) {
      showToast('Chỉ Quản trị viên (Admin) mới có quyền xóa biên bản phạt.', 'error');
      return;
    }

    if (!window.confirm(`Xác nhận xóa biên bản phạt "${p.id}" của khách hàng "${p.customerName || 'khách'}"?`)) {
      return;
    }

    try {
      await penaltyService.deletePenalty(p.id);
      showToast(`Đã xóa biên bản phạt ${p.id}.`);
      fetchData();
      if (selectedPenalty?.id === p.id) {
        setSelectedPenalty(null);
      }
    } catch (err: any) {
      showToast(err.message || 'Không thể xóa biên bản phạt.', 'error');
    }
  };

  return (
    <div className="flex-1 min-w-0">
      <Header
        title="Biên Bản Phí Phạt Vi Phạm (Penalties)"
        description="Tra cứu và theo dõi các biên bản phạt phát sinh tự động khi khách hàng trả xe (trả muộn, trầy xước, vi phạm hợp đồng)"
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
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl border border-amber-100">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Tổng Số Biên Bản Phạt</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{penalties.length}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-xl border border-red-100">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Tổng Tiền Thu Phạt</p>
              <h3 className="text-2xl font-black text-red-600 mt-0.5">{formatCurrency(totalPenaltiesAmount)}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl border border-blue-100">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Phiếu Trả Xe Đã Gắn Phạt</p>
              <h3 className="text-2xl font-black text-blue-700 mt-0.5">
                {new Set(penalties.map((p) => p.returnId)).size}
              </h3>
            </div>
          </div>
        </div>

        {/* Thông tin quy trình tự động */}
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-100 flex items-center gap-2.5 text-xs text-blue-800">
          <span className="text-base">💡</span>
          <span className="font-medium">
            Biên bản phạt được <b>tự động tạo đồng bộ</b> khi nhân viên lập phiếu trả xe tại mục{' '}
            <b className="underline">Trả xe & Quyết toán</b>. Trang này dùng để tìm kiếm, tra cứu chi tiết và xóa biên bản nếu có khiếu nại.
          </span>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-[320px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm biên bản phạt theo mã, phiếu trả xe, tên khách, biển số..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg text-sm py-2 px-3 text-slate-700 focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="Tất cả">Tất cả loại vi phạm</option>
                <option value="Phạt trả muộn">Phạt trả muộn</option>
                <option value="Phạt hỏng hóc">Phạt hỏng hóc / trầy xước</option>
                <option value="Cả trả muộn và hỏng hóc">Cả trả muộn & hỏng hóc</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              title="Làm mới"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Penalties Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Mã Phạt</th>
                  <th className="px-5 py-3.5">Mã Phiếu Trả</th>
                  <th className="px-5 py-3.5">Khách Hàng</th>
                  <th className="px-5 py-3.5">Phương Tiện</th>
                  <th className="px-5 py-3.5">Loại Vi Phạm</th>
                  <th className="px-5 py-3.5">Số Tiền Phạt</th>
                  <th className="px-5 py-3.5">Lý Do / Ghi Chú</th>
                  <th className="px-5 py-3.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs">Đang tải danh sách biên bản phạt...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredPenalties.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                      Chưa ghi nhận biên bản phạt vi phạm nào.
                    </td>
                  </tr>
                ) : (
                  filteredPenalties.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-900 text-xs font-mono">
                        {p.id}
                      </td>
                      <td className="px-5 py-4 font-mono text-blue-600 font-bold text-xs">
                        {p.returnId}
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-900">
                        {p.customerName || 'Khách hàng'}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">{p.carName || 'Phương tiện'}</p>
                        {p.carPlate && (
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-[11px] font-mono font-bold tracking-wider inline-block mt-0.5">
                            {p.carPlate}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          {p.type}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-bold text-red-600 text-sm">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-600 max-w-sm">
                        <p className="line-clamp-2 leading-relaxed" title={p.notes}>
                          {p.notes || 'Không có ghi chú thêm'}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedPenalty(p)}
                            className="p-1.5 rounded-md text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-colors"
                            title="Xem chi tiết biên bản phạt"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {isAdmin && (
                            <button
                              onClick={() => handleDeletePenalty(p)}
                              className="p-1.5 rounded-md text-slate-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                              title="Xóa biên bản phạt (Admin only)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Xem Chi Tiết Biên Bản Phạt */}
      {selectedPenalty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-red-100 text-red-700 font-mono font-bold text-xs">
                  {selectedPenalty.id}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Chi Tiết Biên Bản Phí Phạt</h3>
                  <p className="text-xs text-slate-500">Mã phiếu trả xe: {selectedPenalty.returnId}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPenalty(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Khách Hàng Vi Phạm:</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedPenalty.customerName || 'Khách hàng'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Phương Tiện:</span>
                  <span className="font-semibold text-slate-800">
                    {(selectedPenalty as any).carName || 'Xe'} ({(selectedPenalty as any).carPlate || '---'})
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Loại Vi Phạm:</span>
                  <span className="px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800">
                    {selectedPenalty.type}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-sm font-bold">
                  <span className="text-slate-800">Số Tiền Phạt:</span>
                  <span className="text-red-600 font-black">{formatCurrency(selectedPenalty.amount)}</span>
                </div>
              </div>

              <div>
                <p className="font-bold text-slate-800 mb-1">Lý Do Chi Tiết / Biên Bản Hiện Trường:</p>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed">
                  {selectedPenalty.notes || 'Không có ghi chú thêm về vi phạm này.'}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                {isAdmin ? (
                  <button
                    onClick={() => handleDeletePenalty(selectedPenalty)}
                    className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hủy / Xóa Biên Bản Này</span>
                  </button>
                ) : (
                  <div />
                )}

                <button
                  onClick={() => setSelectedPenalty(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
