import axiosClient from './axiosClient';
import { ApiResponse, ContactMessage } from '../types';

export const contactService = {
  getContacts: async (): Promise<ApiResponse<ContactMessage[]>> => {
    return axiosClient.get('/contacts');
  },

  updateContactStatus: async (id: string | number, status: 'Mới' | 'Đã phản hồi'): Promise<ApiResponse<ContactMessage>> => {
    return axiosClient.patch(`/contacts/${id}/status`, { status });
  },
};
