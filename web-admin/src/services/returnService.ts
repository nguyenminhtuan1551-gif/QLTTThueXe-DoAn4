import axiosClient from './axiosClient';
import { ApiResponse, ReturnRecord } from '../types';

export const returnService = {
  getReturns: async (params?: Record<string, any>): Promise<ApiResponse<ReturnRecord[]>> => {
    return axiosClient.get('/returns', { params });
  },

  getReturnById: async (id: string): Promise<ApiResponse<ReturnRecord>> => {
    return axiosClient.get(`/returns/${id}`);
  },

  createReturn: async (data: Partial<ReturnRecord>): Promise<ApiResponse<ReturnRecord>> => {
    return axiosClient.post('/returns', data);
  },

  updateReturn: async (id: string, data: Partial<ReturnRecord>): Promise<ApiResponse<ReturnRecord>> => {
    return axiosClient.put(`/returns/${id}`, data);
  },
};
