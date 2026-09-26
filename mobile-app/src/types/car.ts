export type CarStatus = 'Sẵn sàng' | 'Đang thuê' | 'Bảo trì' | 'Đặt thuê';

export interface BookingSchedule {
  contractId: string;
  startDate: string;
  endDate: string;
  status: string;
}

export interface Car {
  id: string;
  licensePlate: string;
  name: string;
  type: string; // Sedan, SUV, Crossover, Hatchback, MPV, etc.
  brand: string; // Toyota, Mazda, Hyundai, Honda, VinFast, etc.
  year: number;
  price: number; // Giá thuê theo ngày (VND)
  fuelType: string; // Xăng, Dầu, Điện, Hybrid
  seatCount: number; // 4, 5, 7, 9, 16
  status: CarStatus;
  publicStatus?: string;
  image?: string;
  notes?: string;
  location?: string; // Khu vực / Địa điểm bãi xe (Cầu Giấy, Nam Từ Liêm, Hà Nội,...)
  createdAt?: string;
  updatedAt?: string;

  // Đăng kiểm (Inspection info)
  inspectionId?: string | null;
  inspectionDate?: string | null;
  inspectionExpiryDate?: string | null;
  inspectionStatus?: string | null;
  isInspectionExpired?: boolean;

  // Lịch đặt trước (Booking schedules)
  bookingSchedules?: BookingSchedule[];
  nextBookedStartDate?: string | null;
  nextBookedEndDate?: string | null;
  hasBookingConflict?: boolean;
  canBook?: boolean;

  // Thống kê nổi bật
  completedContracts?: number;
  completedRevenue?: number;
}

export interface CarFilterParams {
  brand?: string;
  type?: string;
  seatCount?: number;
  fuelType?: string;
  status?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  availableOnly?: boolean;
  page?: number;
  limit?: number;
}
