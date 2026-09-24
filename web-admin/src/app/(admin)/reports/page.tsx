'use client';

import React, { useEffect, useState } from 'react';
import {
  Calendar,
  DollarSign,
  Download,
  Printer,
  RefreshCw,
  TrendingUp,
  Wrench,
  AlertTriangle,
  Car as CarIcon,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Header } from '../../../components/Header';
import { dashboardService } from '../../../services/dashboardService';
import { RevenueReportData } from '../../../types';

export default function ReportsPage() {
  const today = new Date();
  const startOfYear = `${today.getFullYear()}-01-01`;
  const todayStr = today.toISOString().slice(0, 10);

  const [fromDate, setFromDate] = useState(startOfYear);
  const [toDate, setToDate] = useState(todayStr);
  const [report, setReport] = useState<RevenueReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchReport = async () => {
    if (!fromDate || !toDate) {
      showToast('Vui lòng chọn đầy đủ từ ngày và đến ngày.', 'error');
      return;
    }
    if (toDate < fromDate) {
      showToast('Đến ngày không được nhỏ hơn từ ngày.', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await dashboardService.getRevenueReport({ fromDate, toDate });
      if (response.success && response.data) {
        setReport(response.data);
      }
    } catch (err: any) {
      showToast(err.message || 'Không thể tải báo cáo doanh thu.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
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

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!report || !report.items.length) {
      showToast('Không có dữ liệu để xuất file.', 'error');
      return;
    }

    const headers = [
      'Mã Xe',
      'Tên Xe',
      'Biển Số',
      'Số Lượt Thuê',
      'Doanh Thu Thuê (VND)',
      'Chi Phí Bảo Trì (VND)',
      'Thu Tiền Phạt (VND)',
      'Lợi Nhuận Thuần (VND)',
    ];

    const rows = report.items.map((item) => [
      item.carId,
      `"${item.carName}"`,
      item.carPlate,
      item.rentals,
      item.revenue,
      item.maintenanceCost,
      item.penaltyFee,
      item.totalAmount,
    ]);

    // Summary row
    rows.push([
      'TỔNG CỘNG',
      'TOÀN TRUNG TÂM',
      '',
      report.summary.rentals,
      report.summary.revenue,
      report.summary.maintenanceCost,
      report.summary.penaltyFee,
      report.summary.totalAmount,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,﻿' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Bao_Cao_Doanh_Thu_${fromDate}_den_${toDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Xuất file thống kê Excel / CSV thành công!');
  };

  return (
    <div className="flex-1 min-w-0">
      <Header
        title="Báo Cáo Tài Chính & Hiệu Quả Đội Xe (Financial Reports)"
        description="Thống kê doanh thu tiền thuê, phân tích chi phí bảo dưỡng phụ tùng, thu phí phạt và tính lợi nhuận ròng của từng xe"
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
        {/* Date Filter & Export Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Khoảng thời gian:</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
              />
              <span className="text-slate-400 text-xs">➔</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={fetchReport}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Xem Báo Cáo</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất File CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Báo Cáo</span>
            </button>
          </div>
        </div>

        {/* Printable Title Header */}
        <div className="hidden print:block text-center mb-6">
          <h1 className="text-2xl font-black text-slate-900 uppercase">BÁO CÁO DOANH THU & HIỆU QUẢ HOẠT ĐỘNG</h1>
          <p className="text-sm text-slate-600 mt-1">Từ ngày {formatDate(fromDate)} đến ngày {formatDate(toDate)}</p>
          <p className="text-xs text-slate-400 mt-0.5">Trung Tâm Cho Thuê Xe Tự Lái Car Rental Hà Nội</p>
        </div>

        {/* KPI Summaries Cards */}
        {report && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl border border-blue-100">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Doanh Thu Tiền Thuê</p>
                <h3 className="text-xl font-black text-blue-700 mt-0.5">{formatCurrency(report.summary.revenue)}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{report.summary.rentals} lượt thuê xe</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl border border-amber-100">
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Chi Phí Bảo Trì Xe</p>
                <h3 className="text-xl font-black text-amber-700 mt-0.5">{formatCurrency(report.summary.maintenanceCost)}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Bảo dưỡng & sửa chữa</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xl border border-purple-100">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Thu Phí Phạt Vi Phạm</p>
                <h3 className="text-xl font-black text-purple-700 mt-0.5">{formatCurrency(report.summary.penaltyFee)}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Quá hạn & hỏng hóc</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl border border-emerald-100">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Lợi Nhuận Ròng (Thuần)</p>
                <h3 className="text-xl font-black text-emerald-700 mt-0.5">{formatCurrency(report.summary.totalAmount)}</h3>
                <p className="text-[11px] text-emerald-600 font-bold mt-0.5">Doanh thu + Phạt - Chi phí</p>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Chi Tiết Doanh Thu & Lợi Nhuận Từng Xe ({report?.items.length || 0} xe)
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Từ {formatDate(fromDate)} đến {formatDate(toDate)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Mã Xe</th>
                  <th className="px-5 py-3.5">Phương Tiện</th>
                  <th className="px-5 py-3.5">Biển Số</th>
                  <th className="px-5 py-3.5 text-center">Lượt Thuê</th>
                  <th className="px-5 py-3.5 text-right">Doanh Thu Thuê</th>
                  <th className="px-5 py-3.5 text-right">Chi Phí Bảo Trì</th>
                  <th className="px-5 py-3.5 text-right">Thu Tiền Phạt</th>
                  <th className="px-5 py-3.5 text-right">Lợi Nhuận Ròng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs">Đang tổng hợp báo cáo tài chính...</span>
                      </div>
                    </td>
                  </tr>
                ) : !report || report.items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                      Không có phát sinh doanh thu nào trong khoảng thời gian này.
                    </td>
                  </tr>
                ) : (
                  <>
                    {report.items.map((item) => (
                      <tr key={item.carId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-slate-900 font-mono">
                          {item.carId}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-slate-800">
                          {item.carName}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono font-bold tracking-wider">
                            {item.carPlate}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center font-bold text-blue-600">
                          {item.rentals}
                        </td>
                        <td className="px-5 py-3.5 text-right font-bold text-slate-900">
                          {formatCurrency(item.revenue)}
                        </td>
                        <td className="px-5 py-3.5 text-right text-amber-700 font-semibold">
                          {item.maintenanceCost > 0 ? `- ${formatCurrency(item.maintenanceCost)}` : '0 đ'}
                        </td>
                        <td className="px-5 py-3.5 text-right text-purple-700 font-semibold">
                          {item.penaltyFee > 0 ? `+ ${formatCurrency(item.penaltyFee)}` : '0 đ'}
                        </td>
                        <td className="px-5 py-3.5 text-right font-extrabold text-emerald-700 text-sm">
                          {formatCurrency(item.totalAmount)}
                        </td>
                      </tr>
                    ))}

                    {/* Summary Row */}
                    <tr className="bg-slate-100/90 font-bold border-t-2 border-slate-300 text-xs">
                      <td colSpan={3} className="px-5 py-4 text-slate-900 uppercase">
                        TỔNG HỢP TOÀN TRUNG TÂM ({report.summary.cars} xe)
                      </td>
                      <td className="px-5 py-4 text-center font-extrabold text-blue-700">
                        {report.summary.rentals}
                      </td>
                      <td className="px-5 py-4 text-right font-extrabold text-slate-900">
                        {formatCurrency(report.summary.revenue)}
                      </td>
                      <td className="px-5 py-4 text-right font-extrabold text-amber-700">
                        - {formatCurrency(report.summary.maintenanceCost)}
                      </td>
                      <td className="px-5 py-4 text-right font-extrabold text-purple-700">
                        + {formatCurrency(report.summary.penaltyFee)}
                      </td>
                      <td className="px-5 py-4 text-right font-black text-emerald-700 text-base">
                        {formatCurrency(report.summary.totalAmount)}
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
