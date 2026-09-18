import axiosClient from './axiosClient';
import { ApiResponse, Contract, LookupResponseData } from '../types';

export const contractApi = {
  /**
   * Lấy lịch sử thuê xe của khách hàng hiện tại
   */
  getMyRentals: async (): Promise<ApiResponse<Contract[]>> => {
    return axiosClient.get('/contracts/my-rentals');
  },

  /**
   * Lấy chi tiết hợp đồng theo mã hợp đồng
   */
  getContractById: async (id: string): Promise<ApiResponse<Contract>> => {
    return axiosClient.get(`/contracts/${id}`);
  },

  /**
   * Tạo hợp đồng thuê xe mới (hỗ trợ đính kèm hình ảnh qua FormData)
   */
  createBooking: async (formData: FormData): Promise<ApiResponse<Contract>> => {
    return axiosClient.post('/contracts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Tra cứu thông tin hợp đồng độc lập (Mã HĐ, CCCD hoặc SĐT)
   */
  lookupContract: async (params: {
    contractId?: string;
    cccd?: string;
    phone?: string;
  }): Promise<ApiResponse<LookupResponseData>> => {
    return axiosClient.get('/contracts/lookup', { params });
  },
};
