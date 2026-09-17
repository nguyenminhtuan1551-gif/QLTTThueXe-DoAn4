export type CarStatus = 'Sẵn sàng' | 'Đang thuê' | 'Bảo trì' | 'Đặt thuê';

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
  image?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CarFilterParams {
  brand?: string;
  type?: string;
  seatCount?: number;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
}
