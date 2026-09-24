import axiosClient from './axiosClient';
import { ApiResponse, Inspection } from '../types';

export const inspectionService = {
  getInspections: async (params?: Record<string, any>): Promise<ApiResponse<Inspection[]>> => {
    return axiosClient.get('/inspections', { params });
  },

  getExpiringInspections: async (): Promise<ApiResponse<Inspection[]>> => {
    return axiosClient.get('/inspections/alerts/expiring');
  },

  getInspectionById: async (id: string): Promise<ApiResponse<Inspection>> => {
    return axiosClient.get(`/inspections/${id}`);
  },

  createInspection: async (data: Partial<Inspection>): Promise<ApiResponse<Inspection>> => {
    return axiosClient.post('/inspections', data);
  },

  updateInspection: async (id: string, data: Partial<Inspection>): Promise<ApiResponse<Inspection>> => {
    return axiosClient.put(`/inspections/${id}`, data);
  },

  deleteInspection: async (id: string): Promise<ApiResponse<null>> => {
    return axiosClient.delete(`/inspections/${id}`);
  },
};
