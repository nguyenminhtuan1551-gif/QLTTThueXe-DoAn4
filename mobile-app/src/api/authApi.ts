import axiosClient from './axiosClient';
import {
  ApiResponse,
  AuthResponseData,
  AuthUser,
  LoginRequest,
  RegisterRequest,
} from '../types';

export const authApi = {
  /**
   * Đăng nhập tài khoản khách hàng
   */
  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponseData>> => {
    return axiosClient.post('/auth/customers/login', data);
  },

  /**
   * Đăng ký tài khoản khách hàng mới
   */
  register: async (data: RegisterRequest): Promise<ApiResponse<AuthResponseData>> => {
    return axiosClient.post('/auth/customers/register', data);
  },

  /**
   * Lấy thông tin phiên người dùng hiện tại qua JWT
   */
  getMe: async (): Promise<ApiResponse<AuthUser>> => {
    return axiosClient.get('/auth/me');
  },

  /**
   * Đăng xuất
   */
  logout: async (): Promise<ApiResponse<null>> => {
    return axiosClient.post('/auth/logout');
  },
};
