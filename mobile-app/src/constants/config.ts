import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Tự động lấy địa chỉ IP của máy tính từ kết nối Metro Bundler của Expo Go
 * Giúp app luôn kết nối được backend ngay cả khi đổi mạng Wi-Fi
 */
function getDevHost(): string {
  // 1. Lấy host từ expoConfig (SDK 49+)
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost ||
    (Constants as any).manifest?.debuggerHost;

  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return ip;
    }
  }

  // 2. Fallback sang IP Wi-Fi hiện tại của máy tính
  return '192.168.0.110';
}

const LAN_IP = getDevHost();

const DEV_API_URL = Platform.select({
  android: `http://${LAN_IP}:5000/api`,
  ios: `http://${LAN_IP}:5000/api`,
  web: 'http://localhost:5000/api',
  default: `http://${LAN_IP}:5000/api`,
});

export const CONFIG = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || DEV_API_URL,
  IMAGE_BASE_URL: (process.env.EXPO_PUBLIC_API_URL || DEV_API_URL).replace('/api', ''),
  DEFAULT_TIMEOUT: 15000,
  SUPPORT_PHONE: '1900 6868',
  SUPPORT_EMAIL: 'support@thuexetudong.vn',
  APP_NAME: 'Cho Thuê Xe Tự Lái & Có Tài',
  VERSION: '1.0.0',
};
