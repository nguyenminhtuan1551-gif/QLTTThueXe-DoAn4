import axiosClient from './axiosClient';
import { ApiResponse, PenaltyRecord } from '../types';

export const penaltyService = {
  getPenalties: async (params?: Record<string, any>): Promise<ApiResponse<PenaltyRecord[]>> => {
    return axiosClient.get('/penalties', { params });
  },

  getPenaltyById: async (id: string): Promise<ApiResponse<PenaltyRecord>> => {
    return axiosClient.get(`/penalties/${id}`);
  },

  createPenalty: async (data: Partial<PenaltyRecord>): Promise<ApiResponse<PenaltyRecord>> => {
    return axiosClient.post('/penalties', data);
  },

  updatePenalty: async (id: string, data: Partial<PenaltyRecord>): Promise<ApiResponse<PenaltyRecord>> => {
    return axiosClient.put(`/penalties/${id}`, data);
  },

  deletePenalty: async (id: string): Promise<ApiResponse<null>> => {
    return axiosClient.delete(`/penalties/${id}`);
  },
};
