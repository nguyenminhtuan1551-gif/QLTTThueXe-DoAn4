'use client';

import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  DollarSign,
  CheckCircle,
  AlertCircle,
  X,
  FileCheck,
} from 'lucide-react';
import { Header } from '../../../components/Header';
import { penaltyService } from '../../../services/penaltyService';
import { returnService } from '../../../services/returnService';
import { PenaltyRecord, ReturnRecord } from '../../../types';
import { useAuth } from '../../../context/AuthContext';

interface PenaltyFormData {
  id?: string;
  returnId: string;
  type: string;
  amount: number;
  notes?: string;
}

const initialFormData: PenaltyFormData = {
  returnId: '',
  type: 'Phạt trả muộn',
  amount: 200000,
  notes: '',
};

export default function PenaltiesPage() {
  const { isAdmin } = useAuth();
  const [penalties, setPenalties] = useState<PenaltyRecord[]>([]);
  const [returns, setReturns] = useState<ReturnRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('Tất cả');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPenalty, setEditingPenalty] = useState<PenaltyRecord | null>(null);
  const [formData, setFormData] = useState<PenaltyFormData>(initialFormData);
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

  const totalPenaltiesAmount = penalties.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const filteredPenalties = penalties.filter((p) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchId = p.id?.toLowerCase().includes(q);
      const matchReturn = p.returnId?.toLowerCase().includes(q);
      const matchCust = p.customerName?.toLowerCase().includes(q);
      const matchType = p.type?.toLowerCase().includes(q);
      const matchNote = p.notes?.toLowerCase().includes(q);
      if (!matchId && !matchReturn && !matchCust && !matchType && !matchNote) return false;
    }

    if (typeFilter !== 'Tất cả' && p.type !== typeFilter) {
      return false;
    }

    return true;
  });

  const handleOpenCreateModal = () => {
    setEditingPenalty(null);
    setFormData({
      ...initialFormData,
      returnId: returns[0]?.id || '',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (p: PenaltyRecord) => {
    setEditingPenalty(p);
    setFormData({
      id: p.id,
      returnId: p.returnId,
      type: p.type,
      amount: Number(p.amount) || 0,
      notes: p.notes || '',
    });
    setModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.returnId || !formData.type || !formData.amount) {
      showToast('Vui lòng điền đầy đủ các thông tin bắt buộc.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingPenalty) {
        await penaltyService.updatePenalty(editingPenalty.id, formData);
        showToast(`Cập nhật biên bản phạt ${editingPenalty.id} thành công!`);
      } else {
        await penaltyService.createPenalty(formData);
        showToast('Lập biên bản phí phạt thành công!');
      }
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Thao tác không thành công', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePenalty = async (p: PenaltyRecord) => {
    if (!isAdmin) {
      showToast('Chỉ Quản trị viên (Admin) mới có quyền xóa biên bản phạt.', 'error');
      return;
    }

    if (!window.confirm(`Xác nhận xóa biên bản phạt "${p.id}"?`)) {
      return;
    }

    try {
      await penaltyService.deletePenalty(p.id);
      showToast(`Đã xóa biên bản phạt ${p.id}.`);
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Không thể xóa biên bản phạt.', 'error');
    }
  };

  return (
    <div className="flex-1 min-w-0">
      <Header
        title="Quản Lý Phí Phạt Vi Phạm (Penalties)"
        description="Ghi nhận các khoản phụ phí phát sinh khi khách hàng trả muộn, vi phạm điều khoản hoặc làm trầy xước hỏng hóc xe"
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
              <p className="text-xs text-slate-500 font-medium">Phiếu Trả Xe Đã Lập</p>
              <h3 className="text-2xl font-black text-blue-700 mt-0.5">{returns.length}</h3>
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
                placeholder="Tìm biên bản phạt theo mã, phiếu trả xe, tên khách..."
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
                <option value="Phạt hỏng hóc">Phạt hỏng hóc</option>
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

            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Lập Biên Bản Phạt</span>
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
                  <th className="px-5 py-3.5">Mã Phiếu Trả Xe</th>
                  <th className="px-5 py-3.5">Khách Hàng</th>
                  <th className="px-5 py-3.5">Loại Vi Phạm</th>
                  <th className="px-5 py-3.5">Số Tiền Phạt</th>
                  <th className="px-5 py-3.5">Lý Do / Ghi Chú</th>
                  <th className="px-5 py-3.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs">Đang tải danh sách biên bản phạt...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredPenalties.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                      Chưa ghi nhận biên bản phạt vi phạm nào.
                    </td>
                  </tr>
                ) : (
                  filteredPenalties.map((p) => (
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
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 rounded-md text-slate-500 hover:text-amber-600 hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-colors"
                            title="Sửa biên bản phạt"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => handleDeletePenalty(p)}
                              className="p-1.5 rounded-md text-slate-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                              title="Xóa biên bản (Admin only)"
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

      {/* Modal Thêm Mới / Sửa Biên Bản Phạt */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingPenalty ? `Chỉnh Sửa Biên Bản: ${editingPenalty.id}` : 'Lập Biên Bản Phạt Vi Phạm'}
                </h3>
                <p className="text-xs text-slate-500">Gắn với phiếu trả xe để tính vào tổng quyết toán</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Chọn Phiếu Trả Xe Gắn Liền <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.returnId}
                  onChange={(e) => setFormData({ ...formData, returnId: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 font-semibold"
                >
                  <option value="">-- Chọn phiếu trả xe --</option>
                  {returns.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.id} - Khách: {r.customerName} ({r.carName} - {r.carPlate})
                    </option>
                  ))}
                </select>
                {returns.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">Chưa có phiếu trả xe nào được lập trong hệ thống.</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Loại Vi Phạm Phạt <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 font-semibold"
                >
                  <option value="Phạt trả muộn">Phạt trả muộn</option>
                  <option value="Phạt hỏng hóc">Phạt hỏng hóc</option>
                  <option value="Cả trả muộn và hỏng hóc">Cả trả muộn và hỏng hóc</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Số Tiền Phạt (VND) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={10000}
                  step={50000}
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 font-bold text-red-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Lý Do Chi Tiết & Hiện Trạng Vi Phạm
                </label>
                <textarea
                  rows={3}
                  placeholder="Ví dụ: Trả xe muộn 4 tiếng so với giờ hẹn, xước cản trước bên phụ khi lùi..."
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
                  disabled={submitting || !formData.returnId}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
                >
                  {submitting ? 'Đang Lưu...' : editingPenalty ? 'Lưu Thay Đổi' : 'Lập Biên Bản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
