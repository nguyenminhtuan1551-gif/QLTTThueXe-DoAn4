import axiosClient from './axiosClient';
import { ApiResponse, Customer, Contract } from '../types';

export const customerService = {
  getCustomers: async (params?: Record<string, any>): Promise<ApiResponse<Customer[]>> => {
    return axiosClient.get('/customers', { params });
  },

  getCustomerById: async (id: string): Promise<ApiResponse<Customer>> => {
    return axiosClient.get(`/customers/${id}`);
  },

  getCustomerRentals: async (id: string): Promise<ApiResponse<Contract[]>> => {
    return axiosClient.get(`/customers/${id}/rentals`);
  },

  createCustomer: async (data: Partial<Customer>): Promise<ApiResponse<Customer>> => {
    return axiosClient.post('/customers', data);
  },

  updateCustomer: async (id: string, data: Partial<Customer>): Promise<ApiResponse<Customer>> => {
    return axiosClient.put(`/customers/${id}`, data);
  },

  deleteCustomer: async (id: string): Promise<ApiResponse<null>> => {
    return axiosClient.delete(`/customers/${id}`);
  },
};
