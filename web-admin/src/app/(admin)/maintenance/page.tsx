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
  Wrench,
  DollarSign,
  Calendar,
  Check,
} from 'lucide-react';
import { Header } from '../../../components/Header';
import { maintenanceService } from '../../../services/maintenanceService';
import { carService } from '../../../services/carService';
import { Maintenance, Car } from '../../../types';
import { useAuth } from '../../../context/AuthContext';

interface MaintenanceFormData {
  id?: string;
  carId: string;
  date: string;
  content: string;
  cost: number;
  status: 'Đang bảo trì' | 'Hoàn thành';
}

const initialFormData: MaintenanceFormData = {
  carId: '',
  date: new Date().toISOString().slice(0, 10),
  content: '',
  cost: 500000,
  status: 'Đang bảo trì',
};

export default function MaintenancePage() {
  const { isAdmin } = useAuth();
  const [records, setRecords] = useState<Maintenance[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Maintenance | null>(null);
  const [formData, setFormData] = useState<MaintenanceFormData>(initialFormData);
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
      const [maintRes, carsRes] = await Promise.all([
        maintenanceService.getMaintenanceRecords(),
        carService.getCars(),
      ]);

      if (maintRes.success && maintRes.data) {
        setRecords(maintRes.data);
      }
      if (carsRes.success && carsRes.data) {
        setCars(carsRes.data);
      }
    } catch (error: any) {
      showToast(error.message || 'Lỗi khi tải dữ liệu bảo trì', 'error');
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

  // Stats calculation
  const totalCount = records.length;
  const inProgressCount = records.filter((r) => r.status === 'Đang bảo trì').length;
  const completedCount = records.filter((r) => r.status === 'Hoàn thành').length;
  const totalCost = records.reduce((sum, r) => sum + (Number(r.cost) || 0), 0);

  const filteredRecords = records.filter((item) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchId = item.id?.toLowerCase().includes(q);
      const matchCar = item.carName?.toLowerCase().includes(q);
      const matchPlate = item.carPlate?.toLowerCase().includes(q);
      const matchContent = item.content?.toLowerCase().includes(q);
      if (!matchId && !matchCar && !matchPlate && !matchContent) return false;
    }

    if (statusFilter !== 'Tất cả' && item.status !== statusFilter) {
      return false;
    }

    return true;
  });

  const handleOpenCreateModal = () => {
    setEditingRecord(null);
    setFormData({
      ...initialFormData,
      carId: cars[0]?.id || '',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (item: Maintenance) => {
    setEditingRecord(item);
    setFormData({
      id: item.id,
      carId: item.carId,
      date: item.date?.slice(0, 10) || '',
      content: item.content || '',
      cost: Number(item.cost) || 0,
      status: item.status,
    });
    setModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.carId || !formData.date || !formData.content.trim()) {
      showToast('Vui lòng điền đầy đủ các thông tin bảo trì.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingRecord) {
        await maintenanceService.updateMaintenance(editingRecord.id, formData);
        showToast(`Cập nhật phiếu bảo trì ${editingRecord.id} thành công!`);
      } else {
        await maintenanceService.createMaintenance(formData);
        showToast(
          formData.status === 'Đang bảo trì'
            ? 'Tạo phiếu bảo trì thành công! Trạng thái xe đã tự động chuyển sang "Bảo trì".'
            : 'Tạo phiếu bảo trì thành công!'
        );
      }
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Thao tác không thành công', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteMaintenance = async (item: Maintenance) => {
    if (
      !window.confirm(
        `Xác nhận hoàn thành bảo trì cho xe ${item.carName} (${item.carPlate})? Trạng thái xe sẽ tự động chuyển về "Sẵn sàng".`
      )
    ) {
      return;
    }

    try {
      await maintenanceService.updateMaintenance(item.id, {
        carId: item.carId,
        date: item.date,
        content: item.content,
        cost: item.cost,
        status: 'Hoàn thành',
      });
      showToast(`Đã hoàn thành bảo trì! Xe ${item.carName} hiện đã "Sẵn sàng" cho thuê.`);
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Không thể cập nhật trạng thái.', 'error');
    }
  };

  const handleDeleteRecord = async (item: Maintenance) => {
    if (!isAdmin) {
      showToast('Chỉ Quản trị viên (Admin) mới có quyền xóa phiếu bảo trì.', 'error');
      return;
    }

    if (!window.confirm(`Bạn có chắc muốn xóa phiếu bảo trì "${item.id}" của xe ${item.carName}?`)) {
      return;
    }

    try {
      await maintenanceService.deleteMaintenance(item.id);
      showToast(`Đã xóa phiếu bảo trì ${item.id}.`);
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Không thể xóa phiếu.', 'error');
    }
  };

  return (
    <div className="flex-1 min-w-0">
      <Header
        title="Quản Lý Bảo Trì & Sửa Chữa (Maintenance)"
        description="Ghi nhận nhật ký bảo dưỡng định kỳ, sửa chữa thay thế phụ tùng và kiểm soát chi phí vận hành đội xe"
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
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Tổng Phiếu Bảo Trì</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{totalCount}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl border border-amber-100">
              <Wrench className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Đang Tiến Hành</p>
              <h3 className="text-2xl font-black text-amber-600 mt-0.5">{inProgressCount}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl border border-emerald-100">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Đã Hoàn Thành</p>
              <h3 className="text-2xl font-black text-emerald-700 mt-0.5">{completedCount}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xl border border-purple-100">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Tổng Chi Phí Bảo Trì</p>
              <h3 className="text-xl font-black text-purple-700 mt-0.5">{formatCurrency(totalCost)}</h3>
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
                placeholder="Tìm theo mã phiếu, tên xe, biển số, nội dung..."
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
                <option value="Tất cả">Tất cả trạng thái</option>
                <option value="Đang bảo trì">Đang bảo trì</option>
                <option value="Hoàn thành">Hoàn thành</option>
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
              <span>Tạo Phiếu Bảo Trì</span>
            </button>
          </div>
        </div>

        {/* Maintenance Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Mã Phiếu</th>
                  <th className="px-5 py-3.5">Xe Bảo Trì</th>
                  <th className="px-5 py-3.5">Biển Số</th>
                  <th className="px-5 py-3.5">Ngày Thực Hiện</th>
                  <th className="px-5 py-3.5">Nội Dung Chi Tiết</th>
                  <th className="px-5 py-3.5">Chi Phí</th>
                  <th className="px-5 py-3.5">Trạng Thái</th>
                  <th className="px-5 py-3.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs">Đang tải hồ sơ bảo trì...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                      Không tìm thấy phiếu bảo trì nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((item) => (
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
                          {formatDate(item.date)}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-700 max-w-xs">
                        <p className="line-clamp-2 leading-relaxed">{item.content}</p>
                      </td>
                      <td className="px-5 py-4 font-bold text-blue-600">
                        {formatCurrency(item.cost)}
                      </td>
                      <td className="px-5 py-4">
                        {item.status === 'Đang bảo trì' ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Đang bảo trì
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Hoàn thành
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.status === 'Đang bảo trì' && (
                            <button
                              onClick={() => handleCompleteMaintenance(item)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xs transition-colors"
                              title="Đánh dấu hoàn thành"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Xong</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 rounded-md text-slate-500 hover:text-amber-600 hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-colors"
                            title="Chỉnh sửa phiếu bảo trì"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteRecord(item)}
                              className="p-1.5 rounded-md text-slate-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                              title="Xóa phiếu (Admin only)"
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

      {/* Modal Thêm mới / Cập nhật bảo trì */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingRecord ? `Chỉnh Sửa Phiếu Bảo Trì: ${editingRecord.id}` : 'Tạo Phiếu Bảo Trì / Sửa Chữa'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tự động chuyển xe sang trạng thái "Bảo trì" khi tạo phiếu
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
                  Xe Cần Bảo Trì <span className="text-red-500">*</span>
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
                      {c.name} ({c.licensePlate}) - Trạng thái: {c.status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Ngày Bảo Dưỡng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Chi Phí (VND) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={50000}
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 font-bold text-blue-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Trạng Thái Bảo Trì
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as 'Đang bảo trì' | 'Hoàn thành',
                    })
                  }
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 font-semibold"
                >
                  <option value="Đang bảo trì">Đang bảo trì (Khóa xe không cho thuê)</option>
                  <option value="Hoàn thành">Hoàn thành (Xe trở về Sẵn sàng)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nội Dung Chi Tiết Bảo Dưỡng / Sửa Chữa <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ví dụ: Thay dầu máy, thay lọc gió, đảo lốp, bảo dưỡng phanh trước sau tại Toyota Mỹ Đình..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
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
                  {submitting ? 'Đang Lưu...' : editingRecord ? 'Lưu Thay Đổi' : 'Tạo Phiếu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
