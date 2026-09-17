import axiosClient from './axiosClient';
import { ApiResponse, Employee } from '../types';

export const employeeService = {
  getEmployees: async (params?: Record<string, any>): Promise<ApiResponse<Employee[]>> => {
    return axiosClient.get('/employees', { params });
  },

  createEmployee: async (data: Partial<Employee> & { password?: string }): Promise<ApiResponse<Employee>> => {
    return axiosClient.post('/employees', data);
  },

  updateEmployee: async (id: string, data: Partial<Employee>): Promise<ApiResponse<Employee>> => {
    return axiosClient.put(`/employees/${id}`, data);
  },

  deleteEmployee: async (id: string): Promise<ApiResponse<null>> => {
    return axiosClient.delete(`/employees/${id}`);
  },
};
