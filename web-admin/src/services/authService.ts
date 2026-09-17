import axiosClient from './axiosClient';
import { AdminUser, ApiResponse } from '../types';

export const authService = {
  /**
   * Đăng nhập cổng quản trị (Admin / Nhân viên)
   */
  login: async (credentials: {
    identifier: string;
    password: string;
  }): Promise<ApiResponse<{ token: string; user: AdminUser }>> => {
    return axiosClient.post('/auth/admin/login', credentials);
  },

  /**
   * Lấy thông tin tài khoản hiện tại
   */
  getMe: async (): Promise<ApiResponse<AdminUser>> => {
    return axiosClient.get('/auth/me');
  },

  /**
   * Đăng xuất phiên làm việc
   */
  logout: async (): Promise<ApiResponse<null>> => {
    return axiosClient.post('/auth/logout');
  },

  /**
   * Đổi mật khẩu tài khoản quản trị
   */
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<null>> => {
    return axiosClient.patch('/auth/admin/change-password', data);
  },
};
