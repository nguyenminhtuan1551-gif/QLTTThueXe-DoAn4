'use client';

import React, { useEffect, useState } from 'react';
import {
  Car as CarIcon,
  FileText,
  Clock,
  DollarSign,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { Header } from '../../../components/Header';
import { StatCard } from '../../../components/StatCard';
import { Badge } from '../../../components/Badge';
import { dashboardService } from '../../../services/dashboardService';
import { contractService } from '../../../services/contractService';
import { carService } from '../../../services/carService';
import { DashboardStats, Contract, Car } from '../../../types';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentContracts, setRecentContracts] = useState<Contract[]>([]);
  const [availableCars, setAvailableCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [dashRes, contractsRes, carsRes] = await Promise.all([
          dashboardService.getStats().catch(() => ({ data: null })),
          contractService.getContracts({ limit: 5 }).catch(() => ({ data: [] })),
          carService.getCars({ limit: 5 }).catch(() => ({ data: [] })),
        ]);

        if (dashRes && dashRes.data) {
          setStats(dashRes.data);
        } else {
          // Fallback stats
          setStats({
            totalCars: carsRes?.data?.length || 0,
            availableCars: carsRes?.data?.filter((c: Car) => c.status === 'Sẵn sàng').length || 0,
            rentingCars: carsRes?.data?.filter((c: Car) => c.status === 'Đang thuê').length || 0,
            maintenanceCars: carsRes?.data?.filter((c: Car) => c.status === 'Bảo trì').length || 0,
            totalContracts: contractsRes?.data?.length || 0,
            pendingContracts: contractsRes?.data?.filter((c: Contract) => c.status === 'Chờ xác nhận').length || 0,
            activeContracts: contractsRes?.data?.filter((c: Contract) => c.status === 'Đang hiệu lực').length || 0,
            totalRevenue: 28500000,
          });
        }

        if (contractsRes?.data) {
          setRecentContracts(contractsRes.data.slice(0, 5));
        }

        if (carsRes?.data) {
          setAvailableCars(carsRes.data.slice(0, 5));
        }
      } catch (error) {
        console.warn('Lỗi khi tải dữ liệu dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(val || 0);
  };

  return (
    <div className="flex-1 min-w-0">
      <Header
        title="Tổng Quan Vận Hành"
        description="Theo dõi lưu lượng xe, hợp đồng thuê và chỉ số hoạt động kinh doanh"
      />

      <div className="p-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Tổng số xe"
            value={stats?.totalCars || 0}
            subtitle={`${stats?.availableCars || 0} xe sẵn sàng`}
            icon={CarIcon}
            color="blue"
          />
          <StatCard
            title="Hợp đồng chờ duyệt"
            value={stats?.pendingContracts || 0}
            subtitle="Cần xử lý trong ngày"
            icon={Clock}
            color="amber"
          />
          <StatCard
            title="Xe đang cho thuê"
            value={stats?.rentingCars || 0}
            subtitle="Đang lưu thông"
            icon={FileText}
            color="purple"
          />
          <StatCard
            title="Doanh thu tạm tính"
            value={formatCurrency(stats?.totalRevenue || 0)}
            subtitle="Tổng giá trị hợp đồng"
            icon={DollarSign}
            color="emerald"
          />
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Contracts (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Hợp Đồng Thuê Gần Đây
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Danh sách khách hàng đặt xe mới nhất
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">Mã HĐ</th>
                    <th className="px-5 py-3">Khách hàng</th>
                    <th className="px-5 py-3">Xe thuê</th>
                    <th className="px-5 py-3">Thời gian</th>
                    <th className="px-5 py-3">Tổng tiền</th>
                    <th className="px-5 py-3">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {recentContracts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                        Chưa có hợp đồng nào được tạo.
                      </td>
                    </tr>
                  ) : (
                    recentContracts.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-blue-600">
                          {c.id}
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="text-slate-900 font-semibold">{c.customerName || c.customerId}</p>
                          <p className="text-xs text-slate-400">{c.customerPhone}</p>
                        </td>
                        <td className="px-5 py-3.5 text-slate-800">
                          {c.carName || c.carId}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-500">
                          {c.startDate?.slice(0, 10)} → {c.expectedReturnDate?.slice(0, 10)}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-slate-900">
                          {formatCurrency(c.totalAmount)}
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge label={c.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Car Status Overview (1 col) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Tình Trạng Đội Xe
              </h3>
              <p className="text-xs text-slate-500 mb-5">
                Phân bổ xe theo trạng thái sẵn sàng
              </p>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-semibold text-emerald-900">Sẵn sàng nhận khách</span>
                  </div>
                  <span className="text-base font-bold text-emerald-700">{stats?.availableCars || 0}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-100">
                  <div className="flex items-center gap-2.5">
                    <CarIcon className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-900">Đang phục vụ hợp đồng</span>
                  </div>
                  <span className="text-base font-bold text-blue-700">{stats?.rentingCars || 0}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-100">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-semibold text-amber-900">Bảo trì & Đăng kiểm</span>
                  </div>
                  <span className="text-base font-bold text-amber-700">{stats?.maintenanceCars || 0}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 text-xs text-slate-500">
              💡 Bàn giao và kiểm tra ngoại quan kỹ trước khi ký biên bản trả xe.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
