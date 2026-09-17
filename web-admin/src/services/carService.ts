import axiosClient from './axiosClient';
import { ApiResponse, Car } from '../types';

export const carService = {
  getCars: async (params?: Record<string, any>): Promise<ApiResponse<Car[]>> => {
    return axiosClient.get('/cars', { params });
  },

  getCarById: async (id: string): Promise<ApiResponse<Car>> => {
    return axiosClient.get(`/cars/${id}`);
  },

  createCar: async (data: Partial<Car>): Promise<ApiResponse<Car>> => {
    return axiosClient.post('/cars', data);
  },

  updateCar: async (id: string, data: Partial<Car>): Promise<ApiResponse<Car>> => {
    return axiosClient.put(`/cars/${id}`, data);
  },

  deleteCar: async (id: string): Promise<ApiResponse<null>> => {
    return axiosClient.delete(`/cars/${id}`);
  },

  uploadImage: async (id: string, formData: FormData): Promise<ApiResponse<any>> => {
    return axiosClient.post(`/cars/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
