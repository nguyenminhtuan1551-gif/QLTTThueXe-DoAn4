'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Search, Filter, RefreshCw, Car as CarIcon } from 'lucide-react';
import { Header } from '../../../components/Header';
import { Badge } from '../../../components/Badge';
import { carService } from '../../../services/carService';
import { Car } from '../../../types';

export default function CarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');

  const fetchCars = async () => {
    setLoading(true);
    try {
      const response = await carService.getCars();
      if (response.success && response.data) {
        setCars(response.data);
      }
    } catch (error) {
      console.warn('Lỗi tải danh sách xe:', error);
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

    return true;
  });

  return (
    <div className="flex-1 min-w-0">
      <Header
        title="Quản Lý Đội Xe"
        description="Quản lý thông tin xe, số chỗ ngồi, trạng thái hoạt động và đơn giá thuê theo ngày"
      />

      <div className="p-8 space-y-6">
        {/* Actions Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-[280px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm xe theo tên, hãng, biển số..."
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
                <option value="Sẵn sàng">Sẵn sàng</option>
                <option value="Đang thuê">Đang thuê</option>
                <option value="Bảo trì">Bảo trì</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchCars}
              className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              title="Làm mới"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
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
                  <th className="px-5 py-3.5">Tên Xe & Hãng</th>
                  <th className="px-5 py-3.5">Biển Số</th>
                  <th className="px-5 py-3.5">Thông Số</th>
                  <th className="px-5 py-3.5">Giá Thuê / Ngày</th>
                  <th className="px-5 py-3.5">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs">Đang tải danh sách xe...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredCars.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                      Không tìm thấy xe phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredCars.map((car) => (
                    <tr key={car.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-900 text-xs">
                        {car.id}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-lg shrink-0">
                            🚗
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-snug">{car.name}</p>
                            <p className="text-xs text-slate-400">{car.brand} • {car.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-800">
                        <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-300 text-xs font-mono font-bold tracking-wider">
                          {car.licensePlate}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500">
                        <p>{car.seatCount} chỗ ngồi • {car.fuelType}</p>
                        <p className="text-slate-400 mt-0.5">Đời {car.year}</p>
                      </td>
                      <td className="px-5 py-4 font-bold text-blue-600">
                        {formatCurrency(car.price)}
                      </td>
                      <td className="px-5 py-4">
                        <Badge label={car.status} />
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
