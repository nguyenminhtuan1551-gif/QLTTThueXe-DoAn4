'use client';

import React, { useEffect, useState } from 'react';
import { Search, RefreshCw, UserCheck, Shield } from 'lucide-react';
import { Header } from '../../../components/Header';
import { Badge } from '../../../components/Badge';
import { employeeService } from '../../../services/employeeService';
import { Employee } from '../../../types';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await employeeService.getEmployees();
      if (response.success && response.data) {
        setEmployees(response.data);
      }
    } catch (error) {
      console.warn('Lỗi tải danh sách nhân viên:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filtered = employees.filter((e) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = e.fullName?.toLowerCase().includes(q);
      const matchPhone = e.phone?.toLowerCase().includes(q);
      const matchEmail = e.email?.toLowerCase().includes(q);
      const matchRole = e.role?.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchEmail && !matchRole) return false;
    }
    return true;
  });

  return (
    <div className="flex-1 min-w-0">
      <Header
        title="Quản Lý Nhân Viên"
        description="Quản trị tài khoản nhân viên nội bộ, phân quyền vai trò Admin và Nhân viên vận hành"
      />

      <div className="p-8 space-y-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm nhân viên theo tên, email, SĐT, chức vụ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <button
            onClick={fetchEmployees}
            className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            title="Làm mới"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Mã NV</th>
                  <th className="px-5 py-3.5">Họ & Tên</th>
                  <th className="px-5 py-3.5">Liên Hệ</th>
                  <th className="px-5 py-3.5">Chức Vụ</th>
                  <th className="px-5 py-3.5">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs">Đang tải danh sách nhân viên...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                      Không tìm thấy nhân viên nào.
                    </td>
                  </tr>
                ) : (
                  filtered.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-900 text-xs">
                        {e.id}
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-900">
                        {e.fullName}
                      </td>
                      <td className="px-5 py-4 text-xs">
                        <p className="font-semibold text-slate-800">{e.phone}</p>
                        <p className="text-slate-400">{e.email}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                            e.role === 'Admin'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          <Shield className="w-3 h-3" />
                          {e.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <Badge label={e.status || 'Đang hoạt động'} />
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
