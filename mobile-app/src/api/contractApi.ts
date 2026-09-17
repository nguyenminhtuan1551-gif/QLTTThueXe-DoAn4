import axiosClient from './axiosClient';
import { ApiResponse, Contract } from '../types';

export const contractApi = {
  /**
   * Lấy lịch sử thuê xe của khách hàng hiện tại
   */
  getMyRentals: async (): Promise<ApiResponse<Contract[]>> => {
    return axiosClient.get('/contracts/my-rentals');
  },

  /**
   * Tạo hợp đồng thuê xe mới (hỗ trợ đính kèm hình ảnh)
   */
  createBooking: async (formData: FormData): Promise<ApiResponse<Contract>> => {
    return axiosClient.post('/contracts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Tra cứu thông tin hợp đồng không cần đăng nhập
   */
  lookupContract: async (params: {
    contractId?: string;
    phone?: string;
    licensePlate?: string;
  }): Promise<ApiResponse<Contract[]>> => {
    return axiosClient.get('/contracts/lookup', { params });
  },
};
