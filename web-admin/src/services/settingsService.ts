import axiosClient from './axiosClient';
import { ApiResponse, SystemSettings } from '../types';

export const settingsService = {
  getSettings: async (): Promise<ApiResponse<SystemSettings>> => {
    return axiosClient.get('/settings');
  },

  updateSettings: async (data: Partial<SystemSettings>): Promise<ApiResponse<SystemSettings>> => {
    return axiosClient.put('/settings', data);
  },
};
