export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'Customer' | 'Admin' | 'Nhân viên';
  scope: 'customer' | 'admin';
  cccd?: string;
  address?: string;
  driverLicense?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  cccd?: string;
  phone: string;
  email: string;
  password: string;
  address: string;
  driverLicense: string;
}

export interface AuthResponseData {
  token: string;
  user: AuthUser;
  id?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  role?: string;
  scope?: string;
}
