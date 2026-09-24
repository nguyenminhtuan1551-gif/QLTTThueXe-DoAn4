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
  Users,
  ShieldAlert,
  Wrench,
  Calendar,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Header } from '../../../components/Header';
import { StatCard } from '../../../components/StatCard';
import { Badge } from '../../../components/Badge';
import { dashboardService } from '../../../services/dashboardService';
import { DashboardSummaryData } from '../../../types';

const COLORS_PIE = ['#10B981', '#3B82F6', '#F59E0B', '#64748B'];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const response = await dashboardService.getSummary();
      if (response.success && response.data) {
        setData(response.data);
      }
    } catch (error) {
      console.warn('Lỗi khi tải dữ liệu dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
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
    return `${d}/${m}`;
  };

  const overview = data?.overview;
  const revenueChartData = (data?.revenueByMonth || []).map((item) => ({
    name: `T${Number(item.month)}`,
    revenue: item.revenue,
    rentals: item.rentals,
  }));

  const pieData = (data?.carStatusBreakdown || []).map((item) => ({
    name: item.name,
    value: Number(item.value),
  }));

  return (
    <div className="flex-1 min-w-0">
      <Header
        title="Dashboard Tổng Quan Vận Hành"
        description="Báo cáo KPI thời gian thực, lưu lượng xe, doanh thu 12 tháng và trung tâm cảnh báo rủi ro"
      />

      <div className="p-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Đội xe trung tâm"
            value={overview?.totalCars || 0}
            subtitle={`${overview?.availableCars || 0} xe sẵn sàng • ${overview?.rentingCars || 0} đang thuê`}
            icon={CarIcon}
            color="blue"
          />
          <StatCard
            title="Hợp đồng đang chạy"
            value={overview?.activeContracts || 0}
            subtitle={`Tổng ${overview?.totalContracts || 0} hợp đồng toàn hệ thống`}
            icon={FileText}
            color="purple"
          />
          <StatCard
            title="Khách hàng thành viên"
            value={overview?.totalCustomers || 0}
            subtitle="Đã đăng ký tài khoản"
            icon={Users}
            color="amber"
          />
          <StatCard
            title="Doanh thu tháng này"
            value={formatCurrency(overview?.monthlyRevenue || 0)}
            subtitle="Quyết toán thực tế"
            icon={DollarSign}
            color="emerald"
          />
        </div>

        {/* 2 Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Chart (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span>Biểu Đồ Doanh Thu & Lượt Thuê Trong Năm</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Phân bổ doanh thu thực nhận qua các tháng (Đơn vị: VND)
                </p>
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              {revenueChartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  Chưa có dữ liệu doanh thu các tháng.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} />
                    <YAxis
                      stroke="#94A3B8"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
                    />
                    <Tooltip
                      formatter={(val: any) => [formatCurrency(Number(val)), 'Doanh thu']}
                      labelFormatter={(label) => `Tháng ${label}`}
                      contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    />
                    <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Car Status Donut (1 col) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CarIcon className="w-5 h-5 text-indigo-600" />
                <span>Cơ Cấu Trạng Thái Xe</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tỷ lệ phân bổ trạng thái hoạt động của xe
              </p>
            </div>

            <div className="h-64 w-full flex items-center justify-center">
              {pieData.length === 0 ? (
                <div className="text-slate-400 text-xs">Đang tải phân bổ xe...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>Sẵn sàng: {overview?.availableCars || 0}</span>
              <span>Đang thuê: {overview?.rentingCars || 0}</span>
              <span>Bảo trì: {overview?.maintenanceCars || 0}</span>
            </div>
          </div>
        </div>

        {/* 2-Column Alert Center & Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Warning & Alert Center */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-red-50 text-red-600 border border-red-100">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Trung Tâm Cảnh Báo Vận Hành</h3>
                  <p className="text-xs text-slate-500">Cảnh báo đăng kiểm và hợp đồng đến hạn</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {/* Expiring Inspections */}
              <div>
                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Xe Sắp / Quá Hạn Đăng Kiểm</span>
                </h4>
                {(!data?.alerts?.expiringInspections || data.alerts.expiringInspections.length === 0) ? (
                  <p className="text-xs text-slate-400 p-2.5 bg-slate-50 rounded-lg">
                    ✅ Tất cả các xe đều có hạn đăng kiểm hợp lệ.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {data.alerts.expiringInspections.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-xs">
                        <div>
                          <p className="font-bold text-slate-800">{item.carName} ({item.carPlate})</p>
                          <p className="text-amber-700">Hạn: {item.expiryDate?.slice(0, 10)}</p>
                        </div>
                        <span className="font-bold text-red-600 bg-white px-2 py-0.5 rounded border border-red-200">
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Due Contracts */}
              <div className="pt-2">
                <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>Hợp Đồng Sắp Đến Hạn Trả Xe</span>
                </h4>
                {(!data?.alerts?.dueContracts || data.alerts.dueContracts.length === 0) ? (
                  <p className="text-xs text-slate-400 p-2.5 bg-slate-50 rounded-lg">
                    Không có hợp đồng nào quá hạn bàn giao trả xe.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {data.alerts.dueContracts.map((c) => (
                      <div key={c.id} className="flex items-center justify-between p-2.5 rounded-lg bg-blue-50/70 border border-blue-200 text-xs">
                        <div>
                          <p className="font-bold text-slate-800">{c.customerName} - {c.carName}</p>
                          <p className="text-blue-700">Hẹn trả: {c.expectedReturnDate?.slice(0, 10)}</p>
                        </div>
                        <span className="font-mono font-bold text-blue-700">
                          {c.id}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity Stream */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-blue-100">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Nhật Ký Hoạt Động Mới Nhất</h3>
                  <p className="text-xs text-slate-500">Các giao dịch đặt xe và trả xe vừa diễn ra</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {(!data?.recentActivities || data.recentActivities.length === 0) ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Chưa có hoạt động giao dịch gần đây.
                </div>
              ) : (
                data.recentActivities.map((act, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/60 text-xs">
                    <div className={`p-1.5 rounded-md mt-0.5 shrink-0 ${act.type === 'contract' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {act.type === 'contract' ? <FileText className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 leading-snug">{act.message}</p>
                      <p className="text-slate-400 text-[11px] mt-1">{formatDate(act.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
