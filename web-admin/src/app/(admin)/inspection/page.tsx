'use client';

import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  ClipboardCheck,
  Calendar,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { Header } from '../../../components/Header';
import { inspectionService } from '../../../services/inspectionService';
import { carService } from '../../../services/carService';
import { Inspection, Car } from '../../../types';
import { useAuth } from '../../../context/AuthContext';

interface InspectionFormData {
  id?: string;
  carId: string;
  inspectionDate: string;
  expiryDate: string;
  status: 'Còn hạn' | 'Sắp hết hạn' | 'Hết hạn';
  notes?: string;
}

const initialFormData: InspectionFormData = {
  carId: '',
  inspectionDate: new Date().toISOString().slice(0, 10),
  expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  status: 'Còn hạn',
  notes: '',
};

export default function InspectionPage() {
  const { isAdmin } = useAuth();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInspection, setEditingInspection] = useState<Inspection | null>(null);
  const [formData, setFormData] = useState<InspectionFormData>(initialFormData);
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
      const [inspRes, carsRes] = await Promise.all([
        inspectionService.getInspections(),
        carService.getCars(),
      ]);

      if (inspRes.success && inspRes.data) {
        setInspections(inspRes.data);
      }
      if (carsRes.success && carsRes.data) {
        setCars(carsRes.data);
      }
    } catch (error: any) {
      showToast(error.message || 'Lỗi khi tải dữ liệu đăng kiểm', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '--';
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) return dateStr.slice(0, 10);
    const d = String(parsed.getDate()).padStart(2, '0');
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const y = parsed.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const getDaysLeft = (expiryDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDateStr);
    expiry.setHours(0, 0, 0, 0);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Stats calculation
  const totalCount = inspections.length;
  const validCount = inspections.filter((i) => i.status === 'Còn hạn').length;
  const expiringCount = inspections.filter((i) => i.status === 'Sắp hết hạn').length;
  const expiredCount = inspections.filter((i) => i.status === 'Hết hạn').length;

  const filteredInspections = inspections.filter((item) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchId = item.id?.toLowerCase().includes(q);
      const matchCar = item.carName?.toLowerCase().includes(q);
      const matchPlate = item.carPlate?.toLowerCase().includes(q);
      if (!matchId && !matchCar && !matchPlate) return false;
    }

    if (statusFilter !== 'Tất cả' && item.status !== statusFilter) {
      return false;
    }

    return true;
  });

  const handleOpenCreateModal = () => {
    setEditingInspection(null);
    setFormData({
      ...initialFormData,
      carId: cars[0]?.id || '',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (item: Inspection) => {
    setEditingInspection(item);
    setFormData({
      id: item.id,
      carId: item.carId,
      inspectionDate: item.inspectionDate?.slice(0, 10) || '',
      expiryDate: item.expiryDate?.slice(0, 10) || '',
      status: item.status,
      notes: item.notes || '',
    });
    setModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.carId || !formData.inspectionDate || !formData.expiryDate) {
      showToast('Vui lòng điền đầy đủ các thông tin bắt buộc.', 'error');
      return;
    }

    if (new Date(formData.expiryDate) <= new Date(formData.inspectionDate)) {
      showToast('Hạn đăng kiểm phải sau ngày kiểm định.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingInspection) {
        await inspectionService.updateInspection(editingInspection.id, formData);
        showToast(`Cập nhật kỳ đăng kiểm ${editingInspection.id} thành công!`);
      } else {
        await inspectionService.createInspection(formData);
        showToast('Tạo mới hồ sơ đăng kiểm thành công!');
      }
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Thao tác không thành công', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteInspection = async (item: Inspection) => {
    if (!isAdmin) {
      showToast('Chỉ Quản trị viên (Admin) mới có quyền xóa hồ sơ đăng kiểm.', 'error');
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn xóa hồ sơ đăng kiểm "${item.id}" của xe ${item.carName}?`)) {
      return;
    }

    try {
      await inspectionService.deleteInspection(item.id);
      showToast(`Đã xóa hồ sơ đăng kiểm ${item.id}.`);
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Không thể xóa hồ sơ.', 'error');
    }
  };

  return (
    <div className="flex-1 min-w-0">
      <Header
        title="Quản Lý Đăng Kiểm Xe (Vehicle Inspection)"
        description="Theo dõi thời hạn kiểm định kỹ thuật định kỳ của toàn bộ đội xe để bảo đảm an toàn và quy định đường bộ"
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
        {/* KPI Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl border border-blue-100">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Tổng Số Hồ Sơ</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{totalCount}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl border border-emerald-100">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Đang Còn Hạn</p>
              <h3 className="text-2xl font-black text-emerald-700 mt-0.5">{validCount}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl border border-amber-100">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Sắp Hết Hạn (&le; 30 ngày)</p>
              <h3 className="text-2xl font-black text-amber-600 mt-0.5">{expiringCount}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-xl border border-red-100">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Đã Hết Hạn (Cấm thuê)</p>
              <h3 className="text-2xl font-black text-red-600 mt-0.5">{expiredCount}</h3>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-[320px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm theo mã đăng kiểm, tên xe, biển số..."
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
                <option value="Còn hạn">Còn hạn</option>
                <option value="Sắp hết hạn">Sắp hết hạn</option>
                <option value="Hết hạn">Hết hạn</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Hồ Sơ Đăng Kiểm</span>
            </button>
          </div>
        </div>

        {/* Inspections Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Mã ĐK</th>
                  <th className="px-5 py-3.5">Xe Được Kiểm Định</th>
                  <th className="px-5 py-3.5">Biển Số</th>
                  <th className="px-5 py-3.5">Ngày Đăng Kiểm</th>
                  <th className="px-5 py-3.5">Ngày Hết Hạn</th>
                  <th className="px-5 py-3.5">Thời Gian Còn Lại</th>
                  <th className="px-5 py-3.5">Tình Trạng</th>
                  <th className="px-5 py-3.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs">Đang tải hồ sơ đăng kiểm...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredInspections.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                      Không tìm thấy hồ sơ đăng kiểm nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredInspections.map((item) => {
                    const daysLeft = getDaysLeft(item.expiryDate);

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-4 font-bold text-slate-900 text-xs">
                          {item.id}
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-900 leading-snug">{item.carName}</p>
                          <p className="text-xs text-slate-400">Mã xe: {item.carId}</p>
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-800">
                          <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-300 text-xs font-mono font-bold tracking-wider">
                            {item.carPlate}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-600">
                          <div className="flex items-center gap-1.5 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {formatDate(item.inspectionDate)}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-xs font-bold text-slate-800">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {formatDate(item.expiryDate)}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-xs font-semibold">
                          {daysLeft > 0 ? (
                            <span className={daysLeft <= 30 ? 'text-amber-600' : 'text-slate-600'}>
                              Còn {daysLeft} ngày
                            </span>
                          ) : (
                            <span className="text-red-600 font-bold">Quá hạn {Math.abs(daysLeft)} ngày</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {item.status === 'Còn hạn' && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Còn hạn
                            </span>
                          )}
                          {item.status === 'Sắp hết hạn' && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Sắp hết hạn (&le; 30 ngày)
                            </span>
                          )}
                          {item.status === 'Hết hạn' && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                              Đã hết hạn
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              className="p-1.5 rounded-md text-slate-500 hover:text-amber-600 hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-colors"
                              title="Cập nhật kỳ đăng kiểm"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => handleDeleteInspection(item)}
                                className="p-1.5 rounded-md text-slate-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                                title="Xóa hồ sơ (Admin only)"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Thêm mới / Cập nhật đăng kiểm */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingInspection ? `Cập Nhật Đăng Kiểm: ${editingInspection.id}` : 'Thêm Mới Hồ Sơ Đăng Kiểm'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ghi nhận kỳ kiểm định xe định kỳ bảo đảm an toàn lưu hành
                </p>
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
                  Xe Kiểm Định <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.carId}
                  onChange={(e) => setFormData({ ...formData, carId: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Chọn xe --</option>
                  {cars.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.licensePlate}) - {c.brand}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Ngày Đăng Kiểm <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.inspectionDate}
                    onChange={(e) => setFormData({ ...formData, inspectionDate: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Ngày Hết Hạn <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tình Trạng Hồ Sơ
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as 'Còn hạn' | 'Sắp hết hạn' | 'Hết hạn',
                    })
                  }
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 font-semibold"
                >
                  <option value="Còn hạn">Còn hạn (Hợp lệ cho thuê)</option>
                  <option value="Sắp hết hạn">Sắp hết hạn (&le; 30 ngày)</option>
                  <option value="Hết hạn">Hết hạn (Cấm cho thuê)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Ghi Chú Đăng Kiểm
                </label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú trung tâm đăng kiểm, số tem kiểm định..."
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
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
                >
                  {submitting ? 'Đang Lưu...' : editingInspection ? 'Lưu Thay Đổi' : 'Thêm Hồ Sơ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
