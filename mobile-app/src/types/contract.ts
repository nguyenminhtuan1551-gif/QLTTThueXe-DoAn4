import { Car } from './car';

export type ContractStatus = 'Chờ xác nhận' | 'Đang hiệu lực' | 'Đã hoàn thành' | 'Đã hủy';

export interface BookingImage {
  id?: string;
  path: string;
  fileName?: string;
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
  carBrand?: string;
  startDate: string;
  expectedReturnDate: string;
  pickupPoint: string;
  deposit: number;
  totalAmount: number;
  status: ContractStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  car?: Car;
  pickupImages?: BookingImage[];
}

export interface CreateBookingRequest {
  carId: string;
  startDate: string;
  expectedReturnDate: string;
  pickupPoint: string;
  notes?: string;
  pickupImages?: any[];
}
