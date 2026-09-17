import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../constants/config';
import { STORAGE_KEYS } from '../constants/storageKeys';

const axiosClient = axios.create({
  baseURL: CONFIG.API_BASE_URL,
  timeout: CONFIG.DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Tự động đính kèm Bearer JWT Token vào Header
axiosClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Lỗi khi đọc auth token từ AsyncStorage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Chuẩn hóa dữ liệu trả về và xử lý token hết hạn (401)
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error: AxiosError<any>) => {
    if (error.response?.status === 401) {
      // Khi token hết hạn hoặc không hợp lệ -> xóa cache phiên
      try {
        await AsyncStorage.multiRemove([STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.USER_DATA]);
      } catch (storageError) {
        console.warn('Lỗi khi xóa phiên đăng nhập hết hạn:', storageError);
      }
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      'Đã có lỗi xảy ra trong quá trình xử lý.';

    return Promise.reject({
      status: error.response?.status,
      message,
      data: error.response?.data,
    });
  }
);

export default axiosClient;
