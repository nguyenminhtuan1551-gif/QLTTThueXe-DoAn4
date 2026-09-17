import axiosClient from './axiosClient';
import { ApiResponse, DashboardStats } from '../types';

export const dashboardService = {
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    return axiosClient.get('/dashboard');
  },
};
