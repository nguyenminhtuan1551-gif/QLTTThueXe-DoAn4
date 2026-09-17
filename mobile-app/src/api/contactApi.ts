import axiosClient from './axiosClient';
import { ApiResponse } from '../types';

export interface ContactData {
  fullName: string;
  phone: string;
  email: string;
  content: string;
}

export const contactApi = {
  sendContact: async (data: ContactData): Promise<ApiResponse<any>> => {
    return axiosClient.post('/contacts', data);
  },
};
