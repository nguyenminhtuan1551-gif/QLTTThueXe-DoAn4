import axiosClient from './axiosClient';
import { ApiResponse, Contract } from '../types';

export const contractService = {
  getContracts: async (params?: Record<string, any>): Promise<ApiResponse<Contract[]>> => {
    return axiosClient.get('/contracts', { params });
  },

  getContractById: async (id: string): Promise<ApiResponse<Contract>> => {
    return axiosClient.get(`/contracts/${id}`);
  },

  createContract: async (data: any): Promise<ApiResponse<Contract>> => {
    return axiosClient.post('/contracts', data);
  },

  updateContract: async (id: string, data: Partial<Contract>): Promise<ApiResponse<Contract>> => {
    return axiosClient.put(`/contracts/${id}`, data);
  },

  approveContract: async (id: string): Promise<ApiResponse<Contract>> => {
    return axiosClient.put(`/contracts/${id}`, { status: 'Đang hiệu lực' });
  },

  cancelContract: async (id: string, reason?: string): Promise<ApiResponse<Contract>> => {
    return axiosClient.patch(`/contracts/${id}/cancel`, { reason });
  },

  deleteContract: async (id: string): Promise<ApiResponse<null>> => {
    return axiosClient.delete(`/contracts/${id}`);
  },
};
