import axiosClient from './axiosClient';
import { ApiResponse, Car, CarFilterParams } from '../types';

export const carApi = {
  /**
   * Lấy danh sách xe với bộ lọc
   */
  getCars: async (params?: CarFilterParams): Promise<ApiResponse<Car[]>> => {
    return axiosClient.get('/cars', { params });
  },

  /**
   * Lấy danh sách xe nổi bật hiển thị ở trang chủ
   */
  getFeaturedCars: async (): Promise<ApiResponse<Car[]>> => {
    return axiosClient.get('/cars/featured');
  },

  /**
   * Lấy chi tiết xe theo mã xe
   */
  getCarById: async (id: string): Promise<ApiResponse<Car>> => {
    return axiosClient.get(`/cars/${id}`);
  },
};
