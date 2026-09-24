'use client';

import React, { useEffect, useState } from 'react';
import {
  Search,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Shield,
  X,
  CheckCircle,
  AlertCircle,
  KeyRound,
  UserCheck,
} from 'lucide-react';
import { Header } from '../../../components/Header';
import { Badge } from '../../../components/Badge';
import { employeeService } from '../../../services/employeeService';
import { Employee } from '../../../types';
import { useAuth } from '../../../context/AuthContext';

interface EmployeeFormData {
  id?: string;
  fullName: string;
  phone: string;
  email: string;
  role: 'Admin' | 'Nhân viên';
  status: 'Đang hoạt động' | 'Tạm khóa';
  password?: string;
}

const initialFormData: EmployeeFormData = {
  fullName: '',
  phone: '',
  email: '',
  role: 'Nhân viên',
  status: 'Đang hoạt động',
  password: '',
};

export default function EmployeesPage() {
  const { user, isAdmin } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('Tất cả');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<EmployeeFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await employeeService.getEmployees();
      if (response.success && response.data) {
        setEmployees(response.data);
      }
    } catch (error: any) {
      showToast(error.message || 'Lỗi tải danh sách nhân viên', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingEmployee(null);
    setFormData(initialFormData);
    setModalOpen(true);
  };

  const handleOpenEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      id: emp.id,
      fullName: emp.fullName,
      phone: emp.phone,
      email: emp.email,
      role: emp.role,
      status: emp.status || 'Đang hoạt động',
      password: '',
    });
    setModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.email.trim()) {
      showToast('Vui lòng điền đầy đủ các thông tin bắt buộc.', 'error');
      return;
    }

    if (!editingEmployee && (!formData.password || formData.password.length < 6)) {
      showToast('Mật khẩu tạo mới phải có ít nhất 6 ký tự.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingEmployee) {
        await employeeService.updateEmployee(editingEmployee.id, formData);
        showToast(`Cập nhật thông tin nhân viên ${formData.fullName} thành công!`);
      } else {
        await employeeService.createEmployee(formData);
        showToast(`Tạo mới tài khoản nhân viên ${formData.fullName} thành công!`);
      }
      setModalOpen(false);
      fetchEmployees();
    } catch (err: any) {
      showToast(err.message || 'Thao tác không thành công', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleLock = async (emp: Employee) => {
    const nextStatus = emp.status === 'Tạm khóa' ? 'Đang hoạt động' : 'Tạm khóa';
    if (!window.confirm(`Xác nhận ${nextStatus === 'Tạm khóa' ? 'khóa' : 'mở khóa'} tài khoản của ${emp.fullName}?`)) {
      return;
    }

    try {
      await employeeService.updateEmployee(emp.id, {
        fullName: emp.fullName,
        phone: emp.phone,
        email: emp.email,
        role: emp.role,
        status: nextStatus,
      });
      showToast(`Đã chuyển trạng thái tài khoản sang "${nextStatus}".`);
      fetchEmployees();
    } catch (err: any) {
      showToast(err.message || 'Không thể đổi trạng thái tài khoản.', 'error');
    }
  };

  const handleDeleteEmployee = async (emp: Employee) => {
    if (emp.id === user?.id) {
      showToast('Bạn không thể tự xóa tài khoản của chính mình!', 'error');
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn nhân viên "${emp.fullName}" (${emp.email})?`)) {
      return;
    }

    try {
      await employeeService.deleteEmployee(emp.id);
      showToast(`Đã xóa nhân viên ${emp.fullName}.`);
      fetchEmployees();
    } catch (err: any) {
      showToast(err.message || 'Không thể xóa tài khoản.', 'error');
    }
  };

  const filtered = employees.filter((e) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = e.fullName?.toLowerCase().includes(q);
      const matchPhone = e.phone?.toLowerCase().includes(q);
      const matchEmail = e.email?.toLowerCase().includes(q);
      const matchRole = e.role?.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchEmail && !matchRole) return false;
    }

    if (roleFilter !== 'Tất cả' && e.role !== roleFilter) {
      return false;
    }

    return true;
  });

  return (
    <div className="flex-1 min-w-0">
      <Header
        title="Quản Lý Nhân Sự (Employee Management)"
        description="Quản trị tài khoản nhân viên nội bộ, phân quyền vai trò Quản trị viên (Admin) và Nhân viên điều hành"
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
                placeholder="Tìm nhân viên theo tên, email, SĐT, chức vụ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg text-sm py-2 px-3 text-slate-700 focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="Tất cả">Tất cả vai trò</option>
              <option value="Admin">Admin</option>
              <option value="Nhân viên">Nhân viên</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchEmployees}
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
              <span>Thêm Nhân Viên</span>
            </button>
          </div>
        </div>

        {/* Employees Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Mã NV</th>
                  <th className="px-5 py-3.5">Họ & Tên</th>
                  <th className="px-5 py-3.5">Liên Lạc</th>
                  <th className="px-5 py-3.5">Vai Trò</th>
                  <th className="px-5 py-3.5">Trạng Thái</th>
                  <th className="px-5 py-3.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs">Đang tải danh sách nhân viên...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                      Không tìm thấy nhân viên nào.
                    </td>
                  </tr>
                ) : (
                  filtered.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-900 text-xs font-mono">
                        {e.id}
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-900">
                        {e.fullName}
                      </td>
                      <td className="px-5 py-4 text-xs">
                        <p className="font-semibold text-slate-800">{e.phone}</p>
                        <p className="text-slate-400 mt-0.5">{e.email}</p>
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
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleToggleLock(e)}
                            className={`p-1.5 rounded-md border border-transparent transition-colors ${
                              e.status === 'Tạm khóa'
                                ? 'text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200'
                                : 'text-slate-500 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-200'
                            }`}
                            title={e.status === 'Tạm khóa' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                          >
                            {e.status === 'Tạm khóa' ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(e)}
                            className="p-1.5 rounded-md text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-colors"
                            title="Sửa thông tin"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteEmployee(e)}
                            className="p-1.5 rounded-md text-slate-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                            title="Xóa tài khoản"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Modal Thêm Mới / Sửa Nhân Viên */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingEmployee ? `Cập Nhật Nhân Viên: ${editingEmployee.fullName}` : 'Thêm Mới Nhân Viên'}
                </h3>
                <p className="text-xs text-slate-500">Phân quyền chức vụ và tạo tài khoản đăng nhập portal</p>
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
                  Họ và Tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nguyễn Văn B"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                    Email Đăng Nhập <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="nhanvien@thuexe.vn"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Vai Trò Quyền Hạn
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value as 'Admin' | 'Nhân viên' })
                    }
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 font-semibold"
                  >
                    <option value="Nhân viên">Nhân viên vận hành</option>
                    <option value="Admin">Admin (Quản trị viên)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Trạng Thái Tài Khoản
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as 'Đang hoạt động' | 'Tạm khóa',
                      })
                    }
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 font-semibold"
                  >
                    <option value="Đang hoạt động">Đang hoạt động</option>
                    <option value="Tạm khóa">Tạm khóa tài khoản</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {editingEmployee ? 'Mật Khẩu Mới (Bỏ trống nếu giữ nguyên)' : 'Mật Khẩu Đăng Nhập *'}
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder={editingEmployee ? '••••••••' : 'Tối thiểu 6 ký tự'}
                    value={formData.password || ''}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
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
                  {submitting ? 'Đang Lưu...' : editingEmployee ? 'Lưu Thay Đổi' : 'Tạo Nhân Viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
