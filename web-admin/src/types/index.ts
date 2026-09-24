export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'Admin' | 'Nhân viên';
  scope: 'admin';
  status?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    total?: number;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Car {
  id: string;
  licensePlate: string;
  name: string;
  type: string;
  brand: string;
  year: number;
  price: number;
  fuelType: string;
  seatCount: number;
  status: 'Sẵn sàng' | 'Đang thuê' | 'Bảo trì';
  image?: string;
  notes?: string;
  inspectionId?: string;
  inspectionDate?: string;
  inspectionExpiryDate?: string;
  inspectionStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Inspection {
  id: string;
  carId: string;
  carName?: string;
  carPlate?: string;
  inspectionDate: string;
  expiryDate: string;
  status: 'Còn hạn' | 'Sắp hết hạn' | 'Hết hạn';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Maintenance {
  id: string;
  carId: string;
  carName?: string;
  carPlate?: string;
  date: string;
  content: string;
  cost: number;
  status: 'Đang bảo trì' | 'Hoàn thành';
  createdAt?: string;
  updatedAt?: string;
}

export interface SystemSettings {
  id?: string;
  companyName: string;
  phone: string;
  email: string;
  address: string;
  notifEmail?: boolean;
  notifExpiry?: boolean;
  notifContract?: boolean;
  daysWarning: number;
  updatedAt?: string;
}

export interface Contract {
  id: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  carId: string;
  carName?: string;
  carLicensePlate?: string;
  carImage?: string;
  startDate: string;
  expectedReturnDate: string;
  pickupPoint: string;
  deposit: number;
  totalAmount: number;
  status: 'Chờ xác nhận' | 'Đang hiệu lực' | 'Đã hoàn thành' | 'Đã hủy';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Customer {
  id: string;
  fullName: string;
  cccd?: string;
  phone: string;
  email: string;
  address?: string;
  driverLicense?: string;
  createdAt?: string;
}

export interface Employee {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  role: 'Admin' | 'Nhân viên';
  status: 'Đang hoạt động' | 'Tạm khóa';
  createdAt?: string;
}

export interface DashboardStats {
  totalCars: number;
  availableCars: number;
  rentingCars: number;
  maintenanceCars: number;
  totalContracts: number;
  pendingContracts: number;
  activeContracts: number;
  totalRevenue: number;
}
