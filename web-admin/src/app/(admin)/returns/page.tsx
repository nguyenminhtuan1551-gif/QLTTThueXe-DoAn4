'use client';

import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  Plus,
  Eye,
  FileCheck,
  CheckCircle,
  AlertCircle,
  Calendar,
  DollarSign,
  Car as CarIcon,
  CreditCard,
  AlertTriangle,
  X,
} from 'lucide-react';
import { Header } from '../../../components/Header';
import { returnService } from '../../../services/returnService';
import { contractService } from '../../../services/contractService';
import { ReturnRecord, Contract } from '../../../types';
import { useAuth } from '../../../context/AuthContext';

interface ReturnFormData {
  contractId: string;
  actualReturnDate: string;
  carCondition: string;
  paymentMethod: string;
  actualDays: number;
  totalRent: number;
  deposit: number;
  remaining: number;
  totalPayment: number;
  notes?: string;
  // Penalty integration
  hasPenalty: boolean;
  penaltyType: string;
  penaltyAmount: number;
  penaltyNotes?: string;
}

const initialFormData: ReturnFormData = {
  contractId: '',
  actualReturnDate: new Date().toISOString().slice(0, 10),
  carCondition: 'Xe bình thường, sạch sẽ, không trầy xước, đầy đủ phụ kiện',
  paymentMethod: 'Chuyển khoản',
  actualDays: 1,
  totalRent: 0,
  deposit: 0,
  remaining: 0,
  totalPayment: 0,
  notes: '',
  hasPenalty: false,
  penaltyType: 'Phạt trả muộn',
  penaltyAmount: 200000,
  penaltyNotes: '',
};

export default function ReturnsPage() {
  const { isAdmin } = useAuth();
  const [returns, setReturns] = useState<ReturnRecord[]>([]);
  const [activeContracts, setActiveContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('Tất cả');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<ReturnRecord | null>(null);
  const [formData, setFormData] = useState<ReturnFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [returnsRes, contractsRes] = await Promise.all([
        returnService.getReturns(),
        contractService.getContracts({ status: 'Đang hiệu lực' }),
      ]);

      if (returnsRes.success && returnsRes.data) {
        setReturns(returnsRes.data);
      }
      if (contractsRes.success && contractsRes.data) {
        setActiveContracts(contractsRes.data);
      }
    } catch (error: any) {
      showToast(error.message || 'Lỗi khi tải danh sách trả xe', 'error');
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

  // Re-calculate financial figures when contract, date, or penalty changes
  useEffect(() => {
    if (formData.contractId && formData.actualReturnDate) {
      const targetContract = activeContracts.find((c) => c.id === formData.contractId);
      if (targetContract) {
        const s = new Date(targetContract.startDate);
        const e = new Date(formData.actualReturnDate);
        const days = Math.max(1, Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)));
        const daily =
          Number(targetContract.pricePerDay || 0) ||
          Math.round(Number(targetContract.totalAmount || 0) / Math.max(1, days));
        const rent = days * daily;
        const dep = Number(targetContract.deposit) || 0;
        const rem = Math.max(0, rent - dep);
        const penalty = formData.hasPenalty ? Number(formData.penaltyAmount) || 0 : 0;
        const total = rem + penalty;

        setFormData((prev) => ({
          ...prev,
          actualDays: days,
          totalRent: rent,
          deposit: dep,
          remaining: rem,
          totalPayment: total,
        }));
      }
    }
  }, [
    formData.contractId,
    formData.actualReturnDate,
    formData.hasPenalty,
    formData.penaltyAmount,
    activeContracts,
  ]);

  const handleOpenCreateModal = () => {
    const firstContract = activeContracts[0];
    setFormData({
      ...initialFormData,
      contractId: firstContract?.id || '',
    });
    setModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.contractId || !formData.actualReturnDate || !formData.paymentMethod) {
      showToast('Vui lòng điền đầy đủ các thông tin bắt buộc.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await returnService.createReturn(formData);
      showToast(
        formData.hasPenalty && formData.penaltyAmount > 0
          ? 'Lập phiếu trả xe và tạo biên bản phí phạt thành công! Đã tự động cộng vào quyết toán.'
          : 'Lập phiếu trả xe và quyết toán thành công! Xe đã tự động chuyển về trạng thái "Sẵn sàng".'
      );
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Không thể tạo phiếu trả xe.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReturns = returns.filter((r) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchId = r.id?.toLowerCase().includes(q);
      const matchContract = r.contractId?.toLowerCase().includes(q);
      const matchCust = r.customerName?.toLowerCase().includes(q);
      const matchCar = r.carName?.toLowerCase().includes(q);
      const matchPlate = r.carPlate?.toLowerCase().includes(q);
      if (!matchId && !matchContract && !matchCust && !matchCar && !matchPlate) return false;
    }

    if (paymentFilter !== 'Tất cả' && r.paymentMethod !== paymentFilter) {
      return false;
    }

    return true;
  });

  return (
    <div className="flex-1 min-w-0">
      <Header
        title="Quản Lý Trả Xe & Quyết Toán (Car Returns)"
        description="Lập phiếu bàn giao trả xe, tích hợp xử lý phí phạt vi phạm, khấu trừ tiền cọc và tự động giải phóng xe"
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
        {/* Filters and Actions Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-[320px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm phiếu trả xe theo mã, hợp đồng, tên khách, biển số..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg text-sm py-2 px-3 text-slate-700 focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="Tất cả">Tất cả phương thức</option>
                <option value="Chuyển khoản">Chuyển khoản</option>
                <option value="Tiền mặt">Tiền mặt</option>
                <option value="Momo">Momo</option>
                <option value="ZaloPay">ZaloPay</option>
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

            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Lập Phiếu Trả Xe</span>
            </button>
          </div>
        </div>

        {/* Returns Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Mã Phiếu</th>
                  <th className="px-5 py-3.5">Mã Hợp Đồng</th>
                  <th className="px-5 py-3.5">Khách Hàng</th>
                  <th className="px-5 py-3.5">Xe Trả</th>
                  <th className="px-5 py-3.5">Ngày Trả Thực Tế</th>
                  <th className="px-5 py-3.5">Tình Trạng Khi Nhận</th>
                  <th className="px-5 py-3.5">Tiền Quyết Toán</th>
                  <th className="px-5 py-3.5">Hình Thức</th>
                  <th className="px-5 py-3.5 text-right">Xem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs">Đang tải danh sách phiếu trả xe...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredReturns.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-12 text-center text-slate-400">
                      Chưa có phiếu trả xe nào.
                    </td>
                  </tr>
                ) : (
                  filteredReturns.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-900 text-xs font-mono">
                        {r.id}
                      </td>
                      <td className="px-5 py-4 font-mono text-blue-600 font-bold text-xs">
                        {r.contractId}
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-900">
                        {r.customerName}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">{r.carName}</p>
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-[11px] font-mono font-bold tracking-wider inline-block mt-0.5">
                          {r.carPlate}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs font-medium text-slate-700">
                        <p>{formatDate(r.actualReturnDate)}</p>
                        <p className="text-slate-400 mt-0.5">{r.actualDays} ngày thực tế</p>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-600 max-w-xs">
                        <p className="truncate" title={r.carCondition}>
                          {r.carCondition}
                        </p>
                        {(r.penaltyFee ?? 0) > 0 && (
                          <span className="text-[11px] text-red-600 font-bold">
                            ⚠️ Phạt: +{formatCurrency(r.penaltyFee!)}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs">
                        <p className="font-bold text-emerald-600 text-sm">
                          {formatCurrency(r.totalPayment)}
                        </p>
                        <p className="text-slate-400 mt-0.5">Thuê: {formatCurrency(r.totalRent)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {r.paymentMethod}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedReturn(r)}
                          className="p-1.5 rounded-md text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-colors"
                          title="Xem chi tiết biên bản trả xe"
                        >
                          <Eye className="w-4 h-4" />
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

      {/* Modal Lập Phiếu Trả Xe & Tích Hợp Lập Phí Phạt */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Lập Phiếu Trả Xe, Xử Lý Phạt & Quyết Toán
                </h3>
                <p className="text-xs text-slate-500">
                  Khấu trừ cọc, cộng phí phạt (nếu có), quyết toán và tự động giải phóng xe về "Sẵn sàng"
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Chọn Hợp đồng */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Chọn Hợp Đồng Cần Trả Xe (Đang Hiệu Lực) <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.contractId}
                  onChange={(e) => setFormData({ ...formData, contractId: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 font-semibold"
                >
                  <option value="">-- Chọn hợp đồng đang chạy --</option>
                  {activeContracts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id} - {c.customerName} | Xe: {c.carName} ({c.carLicensePlate || c.carPlate})
                    </option>
                  ))}
                </select>
                {activeContracts.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    Hiện không có hợp đồng nào đang ở trạng thái 'Đang hiệu lực'.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Ngày Trả Xe Thực Tế <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.actualReturnDate}
                    onChange={(e) => setFormData({ ...formData, actualReturnDate: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Hình Thức Thanh Toán <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Chuyển khoản">Chuyển khoản</option>
                    <option value="Tiền mặt">Tiền mặt</option>
                    <option value="Momo">Momo</option>
                    <option value="ZaloPay">ZaloPay</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tình Trạng Xe Lúc Nhận Lại <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ghi nhận hiện trạng: Xe rửa sạch, kim xăng đầy, không móp méo, nội thất nguyên vẹn..."
                  value={formData.carCondition}
                  onChange={(e) => setFormData({ ...formData, carCondition: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Tùy Chọn Phát Sinh Phí Phạt Vi Phạm */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-slate-900">
                      Phát sinh phí phạt vi phạm (nếu có)
                    </span>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-amber-900">
                    <input
                      type="checkbox"
                      checked={formData.hasPenalty}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormData((prev) => ({
                          ...prev,
                          hasPenalty: checked,
                          penaltyAmount: checked ? prev.penaltyAmount || 200000 : 0,
                        }));
                      }}
                      className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                    />
                    <span>Lập biên bản phạt ngay</span>
                  </label>
                </div>

                {formData.hasPenalty && (
                  <div className="space-y-3 pt-2.5 border-t border-amber-200/80">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Loại vi phạm <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.penaltyType}
                          onChange={(e) =>
                            setFormData({ ...formData, penaltyType: e.target.value })
                          }
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 bg-white"
                        >
                          <option value="Phạt trả muộn">Phạt trả muộn</option>
                          <option value="Phạt hỏng hóc">Phạt hỏng hóc / trầy xước</option>
                          <option value="Cả trả muộn và hỏng hóc">Cả trả muộn & hỏng hóc</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Số tiền phạt (VND) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min={10000}
                          step={50000}
                          value={formData.penaltyAmount}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              penaltyAmount: Number(e.target.value) || 0,
                            })
                          }
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-red-600 focus:outline-none focus:border-amber-500 bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Lý do chi tiết & mô tả vi phạm
                      </label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Trả xe trễ 3 tiếng, xước cản trước bên phụ..."
                        value={formData.penaltyNotes || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, penaltyNotes: e.target.value })
                        }
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-amber-500 bg-white"
                      />
                    </div>
                    <p className="text-[11px] text-amber-700 italic">
                      💡 Biên bản phạt sẽ được tự động lưu vào mục "Biên bản Phí phạt" và cộng trực tiếp vào quyết toán bên dưới.
                    </p>
                  </div>
                )}
              </div>

              {/* Bảng Quyết Toán Tài Chính Tự Động */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                  <span>Bảng Quyết Toán Thanh Toán</span>
                </h4>
                <div className="flex justify-between">
                  <span className="text-slate-600">Số ngày thuê thực tế:</span>
                  <span className="font-bold text-slate-900">{formData.actualDays} ngày</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Tổng tiền thuê thực tế:</span>
                  <span className="font-bold text-slate-900">{formatCurrency(formData.totalRent)}</span>
                </div>
                <div className="flex justify-between text-amber-700">
                  <span>Trừ tiền cọc đã nộp:</span>
                  <span className="font-bold">- {formatCurrency(formData.deposit)}</span>
                </div>
                {formData.hasPenalty && formData.penaltyAmount > 0 && (
                  <div className="flex justify-between text-red-600 font-bold">
                    <span>Cộng phí phạt vi phạm:</span>
                    <span>+ {formatCurrency(formData.penaltyAmount)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold">
                  <span className="text-slate-800">Số tiền khách cần thanh toán cuối cùng:</span>
                  <span className="text-emerald-700">{formatCurrency(formData.totalPayment)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Ghi Chú Quyết Toán Thêm
                </label>
                <input
                  type="text"
                  placeholder="Ghi chú thêm của nhân viên lập phiếu..."
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting || !formData.contractId}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
                >
                  {submitting ? 'Đang Xử Lý...' : 'Hoàn Tất Trả Xe & Quyết Toán'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xem Chi Tiết Phiếu Trả Xe */}
      {selectedReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Phiếu Bàn Giao Trả Xe: {selectedReturn.id}
                </h3>
                <p className="text-xs text-slate-500">Mã hợp đồng: {selectedReturn.contractId}</p>
              </div>
              <button
                onClick={() => setSelectedReturn(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <p className="text-slate-400">Khách Hàng:</p>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">
                    {selectedReturn.customerName}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Xe Bàn Giao:</p>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">
                    {selectedReturn.carName} ({selectedReturn.carPlate})
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Ngày trả thực tế:</span>
                  <span className="font-bold text-slate-800">
                    {formatDate(selectedReturn.actualReturnDate)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Số ngày thuê thực tế:</span>
                  <span className="font-bold text-slate-800">
                    {selectedReturn.actualDays} ngày
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Tình trạng xe:</span>
                  <span className="font-medium text-slate-800 max-w-[65%] text-right">
                    {selectedReturn.carCondition}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Tổng tiền thuê:</span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(selectedReturn.totalRent)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 text-amber-700">
                  <span>Tiền cọc đã nộp:</span>
                  <span className="font-bold">{formatCurrency(selectedReturn.deposit)}</span>
                </div>
                {(selectedReturn.penaltyFee ?? 0) > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-100 text-red-600 font-bold">
                    <span>Phí phạt vi phạm phát sinh:</span>
                    <span>+{formatCurrency(selectedReturn.penaltyFee!)}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Hình thức thanh toán:</span>
                  <span className="font-bold text-slate-800">
                    {selectedReturn.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between py-2 text-sm font-bold">
                  <span className="text-slate-900">Tổng tiền thanh toán cuối cùng:</span>
                  <span className="text-emerald-700">
                    {formatCurrency(selectedReturn.totalPayment)}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedReturn(null)}
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
