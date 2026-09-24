'use client';

import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  X,
  Calendar,
  MapPin,
  User,
  Car as CarIcon,
  DollarSign,
  AlertCircle,
  FileText,
  Clock,
  Image as ImageIcon,
} from 'lucide-react';
import { Header } from '../../../components/Header';
import { Badge } from '../../../components/Badge';
import { contractService } from '../../../services/contractService';
import { carService } from '../../../services/carService';
import { Contract, Car } from '../../../types';
import { useAuth } from '../../../context/AuthContext';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const IMAGE_BASE = API_BASE.replace('/api', '');

interface ContractFormData {
  carId: string;
  startDate: string;
  expectedReturnDate: string;
  pickupPoint: string;
  deposit: number;
  totalAmount: number;
  fullName: string;
  phone: string;
  email: string;
  cccd: string;
  driverLicense: string;
  address: string;
  notes?: string;
}

const initialFormData: ContractFormData = {
  carId: '',
  startDate: new Date().toISOString().slice(0, 10),
  expectedReturnDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  pickupPoint: 'Số 10 Phạm Hùng, Cầu Giấy, Hà Nội',
  deposit: 0,
  totalAmount: 0,
  fullName: '',
  phone: '',
  email: '',
  cccd: '',
  driverLicense: '',
  address: 'Hà Nội',
  notes: '',
};

export default function ContractsPage() {
  const { isAdmin } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [availableCars, setAvailableCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');

  // Detail Modal State
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  // Create Contract Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState<ContractFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const [contractsRes, carsRes] = await Promise.all([
        contractService.getContracts(),
        carService.getCars(),
      ]);

      if (contractsRes.success && contractsRes.data) {
        setContracts(contractsRes.data);
      }
      if (carsRes.success && carsRes.data) {
        setAvailableCars(carsRes.data.filter((c) => c.status === 'Sẵn sàng'));
      }
    } catch (error: any) {
      showToast(error.message || 'Lỗi khi tải danh sách hợp đồng', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
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

  // Calculate pricing when car or date changes in form
  useEffect(() => {
    if (formData.carId && formData.startDate && formData.expectedReturnDate) {
      const selectedCar = availableCars.find((c) => c.id === formData.carId);
      if (selectedCar) {
        const s = new Date(formData.startDate);
        const e = new Date(formData.expectedReturnDate);
        const diff = Math.max(1, Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1);
        const total = diff * Number(selectedCar.price || 0);
        const dep = Math.round(total * 0.3);
        setFormData((prev) => ({
          ...prev,
          totalAmount: total,
          deposit: dep,
        }));
      }
    }
  }, [formData.carId, formData.startDate, formData.expectedReturnDate, availableCars]);

  const handleApproveContract = async (id: string, carName?: string) => {
    if (
      !window.confirm(
        `Xác nhận phê duyệt hợp đồng ${id}? Xe sẽ tự động được chuyển sang trạng thái "Đang thuê".`
      )
    ) {
      return;
    }

    try {
      await contractService.approveContract(id);
      showToast(`Hợp đồng ${id} đã được kích hoạt thành công!`);
      fetchContracts();
      if (selectedContract?.id === id) {
        setSelectedContract((prev) => (prev ? { ...prev, status: 'Đang hiệu lực' } : null));
      }
    } catch (err: any) {
      showToast(err.message || 'Không thể phê duyệt hợp đồng.', 'error');
    }
  };

  const handleCancelContract = async (id: string) => {
    const reason = window.prompt('Nhập lý do hủy hợp đồng (tùy chọn):');
    if (reason === null) return;

    try {
      await contractService.cancelContract(id, reason);
      showToast(`Hợp đồng ${id} đã bị hủy.`);
      fetchContracts();
      if (selectedContract?.id === id) {
        setSelectedContract((prev) => (prev ? { ...prev, status: 'Đã hủy' } : null));
      }
    } catch (err: any) {
      showToast(err.message || 'Không thể hủy hợp đồng.', 'error');
    }
  };

  const handleOpenCreateModal = () => {
    const firstCar = availableCars[0];
    setFormData({
      ...initialFormData,
      carId: firstCar?.id || '',
    });
    setCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.carId || !formData.fullName.trim() || !formData.phone.trim() || !formData.pickupPoint.trim()) {
      showToast('Vui lòng điền đầy đủ các trường thông tin bắt buộc.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await contractService.createContract(formData);
      showToast('Tạo hợp đồng thuê xe tại quầy thành công!');
      setCreateModalOpen(false);
      fetchContracts();
    } catch (err: any) {
      showToast(err.message || 'Không thể tạo hợp đồng.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredContracts = contracts.filter((c) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchId = c.id?.toLowerCase().includes(q);
      const matchCust = c.customerName?.toLowerCase().includes(q);
      const matchCar = c.carName?.toLowerCase().includes(q);
      const matchPlate = c.carLicensePlate?.toLowerCase().includes(q);
      const matchPhone = c.customerPhone?.toLowerCase().includes(q);
      if (!matchId && !matchCust && !matchCar && !matchPlate && !matchPhone) return false;
    }

    if (statusFilter !== 'Tất cả' && c.status !== statusFilter) {
      return false;
    }

    return true;
  });

  return (
    <div className="flex-1 min-w-0">
      <Header
        title="Quản Lý Hợp Đồng Thuê Xe (Rental Contracts)"
        description="Tiếp nhận đơn thuê trực tuyến từ ứng dụng Mobile, thẩm định hồ sơ giấy tờ, kích hoạt hợp đồng và điều phối xe"
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
                placeholder="Tìm theo mã HĐ, tên khách hàng, số điện thoại, biển số..."
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
                <option value="Chờ xác nhận">Chờ xác nhận (Mới)</option>
                <option value="Đang hiệu lực">Đang hiệu lực (Đang thuê)</option>
                <option value="Đã hoàn thành">Đã hoàn thành</option>
                <option value="Đã hủy">Đã hủy</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchContracts}
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
              <span>Tạo Hợp Đồng Tại Quầy</span>
            </button>
          </div>
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
                  <th className="px-5 py-3.5">Thời Gian Thuê</th>
                  <th className="px-5 py-3.5">Điểm Nhận Xe</th>
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
                        <span className="text-xs">Đang tải danh sách hợp đồng...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredContracts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                      Không tìm thấy hợp đồng nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredContracts.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4 font-bold text-blue-600 text-xs font-mono">
                        {c.id}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-900 leading-snug">{c.customerName || c.customerId}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{c.customerPhone}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">{c.carName || c.carId}</p>
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-[11px] font-mono font-bold tracking-wider inline-block mt-0.5">
                          {c.carLicensePlate || c.carPlate || '---'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs font-medium text-slate-700">
                        <p>{formatDate(c.startDate)} ➔ {formatDate(c.expectedReturnDate)}</p>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-600 max-w-[200px]">
                        <p className="truncate" title={c.pickupPoint}>📍 {c.pickupPoint}</p>
                      </td>
                      <td className="px-5 py-4 text-xs">
                        <p className="font-bold text-slate-900 text-sm">{formatCurrency(c.totalAmount)}</p>
                        <p className="text-amber-600 font-semibold mt-0.5">Cọc: {formatCurrency(c.deposit)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <Badge label={c.status} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedContract(c);
                              setActivePhoto(null);
                              setDetailModalOpen(true);
                            }}
                            className="p-1.5 rounded-md text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-colors"
                            title="Xem chi tiết hồ sơ & ảnh giấy tờ"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {c.status === 'Chờ xác nhận' && (
                            <>
                              <button
                                onClick={() => handleApproveContract(c.id, c.carName)}
                                className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded text-xs font-bold transition-colors"
                                title="Kích hoạt hợp đồng và giao xe"
                              >
                                Duyệt Đơn
                              </button>
                              <button
                                onClick={() => handleCancelContract(c.id)}
                                className="px-2.5 py-1 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded text-xs font-semibold transition-colors"
                                title="Hủy bỏ hợp đồng"
                              >
                                Hủy
                              </button>
                            </>
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

      {/* Modal Chi tiết Hợp Đồng & Gallery Ảnh Khách Hàng */}
      {detailModalOpen && selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-700 font-mono font-bold text-xs">
                  {selectedContract.id}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Chi Tiết Hợp Đồng Thuê Xe</h3>
                  <p className="text-xs text-slate-500">Khách hàng: {selectedContract.customerName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge label={selectedContract.status} />
                <button
                  onClick={() => setDetailModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Customer & Vehicle Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-2.5">
                  <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>Hồ Sơ Khách Hàng</span>
                  </h4>
                  <div className="text-xs space-y-1.5 text-slate-600">
                    <p><span className="font-semibold text-slate-800">Họ và tên:</span> {selectedContract.customerName}</p>
                    <p><span className="font-semibold text-slate-800">Số điện thoại:</span> {selectedContract.customerPhone}</p>
                    <p><span className="font-semibold text-slate-800">Email:</span> {selectedContract.customerEmail || 'Chưa cập nhật'}</p>
                    <p><span className="font-semibold text-slate-800">Số CCCD / CMND:</span> {selectedContract.cccd || 'Chưa cập nhật'}</p>
                    <p><span className="font-semibold text-slate-800">Số GPLX:</span> {selectedContract.driverLicense || 'Chưa cập nhật'}</p>
                    <p><span className="font-semibold text-slate-800">Địa chỉ:</span> {selectedContract.customerAddress || 'Hà Nội'}</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-2.5">
                  <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                    <CarIcon className="w-3.5 h-3.5" />
                    <span>Thông Tin Phương Tiện</span>
                  </h4>
                  <div className="text-xs space-y-1.5 text-slate-600">
                    <p><span className="font-semibold text-slate-800">Tên xe:</span> {selectedContract.carName}</p>
                    <p><span className="font-semibold text-slate-800">Biển số:</span> {selectedContract.carLicensePlate || selectedContract.carPlate}</p>
                    <p><span className="font-semibold text-slate-800">Thời gian thuê:</span> {formatDate(selectedContract.startDate)} ➔ {formatDate(selectedContract.expectedReturnDate)}</p>
                    <p><span className="font-semibold text-slate-800">Điểm đón nhận xe:</span> {selectedContract.pickupPoint}</p>
                    <p><span className="font-semibold text-slate-800">Tiền đặt cọc:</span> <span className="font-bold text-amber-600">{formatCurrency(selectedContract.deposit)}</span></p>
                    <p><span className="font-semibold text-slate-800">Tổng tiền dự kiến:</span> <span className="font-bold text-blue-600 text-sm">{formatCurrency(selectedContract.totalAmount)}</span></p>
                  </div>
                </div>
              </div>

              {/* Gallery of Uploaded Documents from Mobile App */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    <span>Ảnh Giấy Tờ & Hồ Sơ Khách Hàng Tải Lên (CCCD, Bằng Lái)</span>
                  </h4>
                  <span className="text-xs font-semibold text-slate-500">
                    {selectedContract.pickupImages?.length || 0} ảnh
                  </span>
                </div>

                {selectedContract.pickupImages && selectedContract.pickupImages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {selectedContract.pickupImages.map((img, idx) => {
                      const photoUrl = img.path?.startsWith('http')
                        ? img.path
                        : `${IMAGE_BASE}${img.path}`;

                      return (
                        <div
                          key={`img-${idx}`}
                          onClick={() => setActivePhoto(photoUrl)}
                          className="group relative h-28 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer shadow-2xs hover:shadow-md transition-all"
                        >
                          <img
                            src={photoUrl}
                            alt={`Hồ sơ ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold">
                            Phóng to 🔍
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-lg text-xs">
                    Khách hàng không đính kèm ảnh giấy tờ khi đặt xe này.
                  </div>
                )}
              </div>

              {/* Active Full Photo Preview */}
              {activePhoto && (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-900/90 text-center relative">
                  <button
                    onClick={() => setActivePhoto(null)}
                    className="absolute top-2 right-2 text-white p-1 rounded-full bg-slate-800 hover:bg-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <img
                    src={activePhoto}
                    alt="Phóng to"
                    className="max-h-72 mx-auto rounded-lg object-contain shadow-lg"
                  />
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Đóng
              </button>

              {selectedContract.status === 'Chờ xác nhận' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleCancelContract(selectedContract.id)}
                    className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Hủy Hợp Đồng
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApproveContract(selectedContract.id, selectedContract.carName)}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold shadow-sm transition-colors"
                  >
                    Phê Duyệt Hợp Đồng (Giao Xe)
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Tạo Hợp Đồng Tại Quầy */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Tạo Hợp Đồng Thuê Xe Tại Quầy</h3>
                <p className="text-xs text-slate-500">Lập hợp đồng trực tiếp cho khách hàng đến quầy giao dịch</p>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Chọn Xe */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Chọn Xe Cho Thuê (Xe Sẵn Sàng) <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.carId}
                  onChange={(e) => setFormData({ ...formData, carId: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 font-semibold"
                >
                  <option value="">-- Chọn xe sẵn sàng --</option>
                  {availableCars.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.licensePlate}) - {c.brand} • {formatCurrency(c.price)}/ngày
                    </option>
                  ))}
                </select>
              </div>

              {/* Lịch trình */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Ngày Thuê <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Ngày Trả Dự Kiến <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expectedReturnDate}
                    onChange={(e) => setFormData({ ...formData, expectedReturnDate: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Thông tin khách hàng */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Họ và Tên Khách Hàng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Số Điện Thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0912345678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Số CCCD / CMND <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="001201012345"
                    value={formData.cccd}
                    onChange={(e) => setFormData({ ...formData, cccd: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Số Giấy Phép Lái Xe (GPLX) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="B2 - 0123456789"
                    value={formData.driverLicense}
                    onChange={(e) => setFormData({ ...formData, driverLicense: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Địa Chỉ Khách Hàng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Số nhà, đường, quận, Hà Nội"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Điểm Bàn Giao Xe Tại Hà Nội <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Số 10 Phạm Hùng, Cầu Giấy, Hà Nội..."
                    value={formData.pickupPoint}
                    onChange={(e) => setFormData({ ...formData, pickupPoint: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Tạm tính chi phí */}
              <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-blue-900">Chi phí dự kiến</p>
                  <p className="text-sm font-bold text-blue-700">Tổng tiền: {formatCurrency(formData.totalAmount)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-amber-900">Tiền cọc giữ xe (30%)</p>
                  <p className="text-sm font-bold text-amber-700">{formatCurrency(formData.deposit)}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
                >
                  {submitting ? 'Đang Tạo Hợp Đồng...' : 'Tạo Hợp Đồng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
