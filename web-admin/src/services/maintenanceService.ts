import axiosClient from './axiosClient';
import { ApiResponse, Maintenance } from '../types';

export const maintenanceService = {
  getMaintenanceRecords: async (params?: Record<string, any>): Promise<ApiResponse<Maintenance[]>> => {
    return axiosClient.get('/maintenance', { params });
  },

  getMaintenanceById: async (id: string): Promise<ApiResponse<Maintenance>> => {
    return axiosClient.get(`/maintenance/${id}`);
  },

  createMaintenance: async (data: Partial<Maintenance>): Promise<ApiResponse<Maintenance>> => {
    return axiosClient.post('/maintenance', data);
  },

  updateMaintenance: async (id: string, data: Partial<Maintenance>): Promise<ApiResponse<Maintenance>> => {
    return axiosClient.put(`/maintenance/${id}`, data);
  },

  deleteMaintenance: async (id: string): Promise<ApiResponse<null>> => {
    return axiosClient.delete(`/maintenance/${id}`);
  },
};
