import axiosClient from './axiosClient';
import {
  ApiResponse,
  DashboardSummaryData,
  DashboardAlerts,
  RevenueReportData,
} from '../types';

export const dashboardService = {
  getSummary: async (): Promise<ApiResponse<DashboardSummaryData>> => {
    return axiosClient.get('/dashboard/summary');
  },

  getAlerts: async (): Promise<ApiResponse<DashboardAlerts>> => {
    return axiosClient.get('/dashboard/alerts');
  },

  getRevenueReport: async (params: {
    fromDate: string;
    toDate: string;
  }): Promise<ApiResponse<RevenueReportData>> => {
    return axiosClient.get('/dashboard/revenue-report', { params });
  },
};
