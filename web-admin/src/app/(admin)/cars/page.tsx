'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Car as CarIcon,
  Fuel,
  Users as UsersIcon,
  Calendar,
  Image as ImageIcon,
} from 'lucide-react';
import { Header } from '../../../components/Header';
import { Badge } from '../../../components/Badge';
import { carService } from '../../../services/carService';
import { Car } from '../../../types';
import { useAuth } from '../../../context/AuthContext';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const IMAGE_BASE = API_BASE.replace('/api', '');

interface CarFormData {
  id?: string;
  licensePlate: string;
  name: string;
  type: string;
  brand: string;
  year: number;
  price: number;
  fuelType: string;
  seatCount: number;
  status: 'Sẵn sàng' | 'Đang thuê' | 'Bảo trì';
  notes?: string;
}

const initialFormData: CarFormData = {
  licensePlate: '',
  name: '',
  type: 'Sedan',
  brand: 'Toyota',
  year: 2024,
  price: 800000,
  fuelType: 'Xăng',
  seatCount: 5,
  status: 'Sẵn sàng',
  notes: '',
};

export default function CarsPage() {
  const { isAdmin } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [brandFilter, setBrandFilter] = useState('Tất cả');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [formData, setFormData] = useState<CarFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  // Upload Image Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [targetCar, setTargetCar] = useState<Car | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchCars = async () => {
    setLoading(true);
    try {
      const response = await carService.getCars();
      if (response.success && response.data) {
        setCars(response.data);
      }
    } catch (error: any) {
      showToast(error.message || 'Lỗi khi tải danh sách xe', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(val || 0);
  };

  const brands = Array.from(new Set(cars.map((c) => c.brand).filter(Boolean)));

  const filteredCars = cars.filter((car) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = car.name?.toLowerCase().includes(q);
      const matchBrand = car.brand?.toLowerCase().includes(q);
      const matchPlate = car.licensePlate?.toLowerCase().includes(q);
      if (!matchName && !matchBrand && !matchPlate) return false;
    }

    if (statusFilter !== 'Tất cả' && car.status !== statusFilter) {
      return false;
    }

    if (brandFilter !== 'Tất cả' && car.brand !== brandFilter) {
      return false;
    }

    return true;
  });

  const handleOpenCreateModal = () => {
    setEditingCar(null);
    setFormData(initialFormData);
    setModalOpen(true);
  };

  const handleOpenEditModal = (car: Car) => {
    setEditingCar(car);
    setFormData({
      id: car.id,
      licensePlate: car.licensePlate,
      name: car.name,
      type: car.type || 'Sedan',
      brand: car.brand || 'Toyota',
      year: car.year || 2024,
      price: car.price || 0,
      fuelType: car.fuelType || 'Xăng',
      seatCount: car.seatCount || 5,
      status: car.status || 'Sẵn sàng',
      notes: car.notes || '',
    });
    setModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.licensePlate.trim() || !formData.price) {
      showToast('Vui lòng điền đầy đủ các thông tin bắt buộc.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingCar) {
        await carService.updateCar(editingCar.id, formData);
        showToast(`Cập nhật thông tin xe ${formData.name} thành công!`);
      } else {
        await carService.createCar(formData);
        showToast(`Thêm mới xe ${formData.name} vào đội xe thành công!`);
      }
      setModalOpen(false);
      fetchCars();
    } catch (err: any) {
      showToast(err.message || 'Thao tác không thành công', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCar = async (car: Car) => {
    if (!isAdmin) {
      showToast('Chỉ Quản trị viên (Admin) mới có quyền xóa xe khỏi hệ thống.', 'error');
      return;
    }

    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa xe "${car.name}" (Biển số: ${car.licensePlate})? Hành động này không thể hoàn tác!`
      )
    ) {
      return;
    }

    try {
      await carService.deleteCar(car.id);
      showToast(`Đã xóa xe ${car.name} khỏi hệ thống.`);
      fetchCars();
    } catch (err: any) {
      showToast(err.message || 'Không thể xóa xe.', 'error');
    }
  };

  // Image Upload Handlers
  const handleOpenUploadModal = (car: Car) => {
    setTargetCar(car);
    setSelectedFile(null);
    setPreviewUrl(
      car.image
        ? car.image.startsWith('http')
          ? car.image
          : `${IMAGE_BASE}${car.image}`
        : null
    );
    setUploadModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadImage = async () => {
    if (!targetCar || !selectedFile) {
      showToast('Vui lòng chọn một file ảnh hợp lệ.', 'error');
      return;
    }

    setUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append('image', selectedFile);

      await carService.uploadImage(targetCar.id, uploadData);
      showToast(`Cập nhật ảnh đại diện xe ${targetCar.name} thành công!`);
      setUploadModalOpen(false);
      fetchCars();
    } catch (err: any) {
      showToast(err.message || 'Tải ảnh lên thất bại.', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex-1 min-w-0">
      <Header
        title="Quản Lý Đội Xe (Fleet Management)"
        description="Theo dõi danh mục xe, kiểm soát trạng thái xe sẵn sàng/đang thuê/bảo trì, cập nhật đơn giá và tải ảnh xe"
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
        {/* Actions Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-[320px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm theo tên xe, hãng xe, biển số..."
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
                <option value="Sẵn sàng">Sẵn sàng</option>
                <option value="Đang thuê">Đang thuê</option>
                <option value="Bảo trì">Bảo trì</option>
              </select>
            </div>

            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg text-sm py-2 px-3 text-slate-700 focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="Tất cả">Tất cả hãng</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchCars}
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
              <span>Thêm Xe Mới</span>
            </button>
          </div>
        </div>

        {/* Cars Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Mã Xe</th>
                  <th className="px-5 py-3.5">Hình Ảnh & Tên Xe</th>
                  <th className="px-5 py-3.5">Biển Số</th>
                  <th className="px-5 py-3.5">Thông Số Kỹ Thuật</th>
                  <th className="px-5 py-3.5">Giá Thuê / Ngày</th>
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
                        <span className="text-xs">Đang tải danh sách xe...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredCars.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                      Không tìm thấy chiếc xe nào phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                ) : (
                  filteredCars.map((car) => {
                    const carImageUrl = car.image
                      ? car.image.startsWith('http')
                        ? car.image
                        : `${IMAGE_BASE}${car.image}`
                      : null;

                    return (
                      <tr key={car.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-4 font-bold text-slate-900 text-xs">
                          {car.id}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-11 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden relative shrink-0 flex items-center justify-center">
                              {carImageUrl ? (
                                <img
                                  src={carImageUrl}
                                  alt={car.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <CarIcon className="w-6 h-6 text-slate-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 leading-snug">{car.name}</p>
                              <p className="text-xs text-slate-400">
                                {car.brand} • {car.type}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-800">
                          <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-300 text-xs font-mono font-bold tracking-wider">
                            {car.licensePlate}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-500">
                          <p className="flex items-center gap-1.5 font-medium text-slate-700">
                            <UsersIcon className="w-3.5 h-3.5 text-slate-400" />
                            {car.seatCount} chỗ • {car.fuelType}
                          </p>
                          <p className="flex items-center gap-1.5 text-slate-400 mt-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            Đời {car.year}
                          </p>
                        </td>
                        <td className="px-5 py-4 font-bold text-blue-600">
                          {formatCurrency(car.price)}
                        </td>
                        <td className="px-5 py-4">
                          <Badge label={car.status} />
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenUploadModal(car)}
                              className="p-1.5 rounded-md text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-colors"
                              title="Tải lên ảnh xe"
                            >
                              <Upload className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(car)}
                              className="p-1.5 rounded-md text-slate-500 hover:text-amber-600 hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-colors"
                              title="Chỉnh sửa thông tin xe"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => handleDeleteCar(car)}
                                className="p-1.5 rounded-md text-slate-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                                title="Xóa xe (Admin only)"
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

      {/* Modal Thêm mới / Chỉnh sửa xe */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingCar ? `Chỉnh Sửa Xe: ${editingCar.name}` : 'Thêm Mới Xe Vào Đội'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Điền các thông số kỹ thuật, biển số xe và giá thuê theo ngày
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitForm} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Tên Xe <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Toyota Vios G"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Biển Số Xe <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: 30K-999.88"
                    value={formData.licensePlate}
                    onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm font-mono uppercase text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Hãng Xe <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Toyota, Mazda, Hyundai, VinFast..."
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Kiểu Dáng Xe
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Crossover">Crossover</option>
                    <option value="Hatchback">Hatchback</option>
                    <option value="MPV">MPV</option>
                    <option value="Bán tải">Bán tải</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Năm Sản Xuất
                  </label>
                  <input
                    type="number"
                    min={2015}
                    max={2030}
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Giá Thuê / Ngày (VND) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    step={50000}
                    min={100000}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 font-bold text-blue-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Số Chỗ Ngồi
                  </label>
                  <select
                    value={formData.seatCount}
                    onChange={(e) => setFormData({ ...formData, seatCount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value={4}>4 chỗ</option>
                    <option value={5}>5 chỗ</option>
                    <option value={7}>7 chỗ</option>
                    <option value={9}>9 chỗ</option>
                    <option value={16}>16 chỗ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Loại Nhiên Liệu
                  </label>
                  <select
                    value={formData.fuelType}
                    onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Xăng">Xăng</option>
                    <option value="Dầu">Dầu Diesel</option>
                    <option value="Điện">Điện</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Trạng Thái Hoạt Động
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as 'Sẵn sàng' | 'Đang thuê' | 'Bảo trì',
                      })
                    }
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 font-semibold"
                  >
                    <option value="Sẵn sàng">Sẵn sàng (Có thể cho thuê ngay)</option>
                    <option value="Đang thuê">Đang thuê (Đang phục vụ khách hàng)</option>
                    <option value="Bảo trì">Bảo trì (Tạm ngừng nhận đơn)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Ghi Chú & Mô Tả Xe
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Mô tả trang bị: camera hành trình, cảm biến áp suất lốp, xe vệ sinh sạch sẽ..."
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Modal Footer */}
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
                  {submitting ? 'Đang Lưu...' : editingCar ? 'Lưu Thay Đổi' : 'Thêm Xe Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tải Lên Ảnh Xe */}
      {uploadModalOpen && targetCar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Tải Ảnh Xe: {targetCar.name}</h3>
                <p className="text-xs text-slate-500">Biển số: {targetCar.licensePlate}</p>
              </div>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="w-full h-48 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 overflow-hidden flex flex-col items-center justify-center relative">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">Chưa có ảnh đại diện</p>
                  </div>
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-2.5 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>{selectedFile ? 'Chọn ảnh khác' : 'Chọn tệp ảnh từ máy'}</span>
                </button>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  disabled={!selectedFile || uploading}
                  onClick={handleUploadImage}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Đang tải lên...</span>
                    </>
                  ) : (
                    <span>Lưu Ảnh Xe</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
