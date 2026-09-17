import axiosClient from './axiosClient';
import { ApiResponse, Customer } from '../types';

export const customerService = {
  getCustomers: async (params?: Record<string, any>): Promise<ApiResponse<Customer[]>> => {
    return axiosClient.get('/customers', { params });
  },

  getCustomerById: async (id: string): Promise<ApiResponse<Customer>> => {
    return axiosClient.get(`/customers/${id}`);
  },
};
