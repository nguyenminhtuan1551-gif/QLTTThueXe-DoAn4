import { Car } from './car';

export type ContractStatus = 'Chờ xác nhận' | 'Đang hiệu lực' | 'Đã hoàn thành' | 'Đã hủy';

export interface BookingImage {
  id?: string;
  contractId?: string;
  path: string;
  fileName?: string;
  createdAt?: string;
}

export interface ReturnRecord {
  id: string;
  contractId: string;
  customerName?: string;
  carName?: string;
  carPlate?: string;
  actualReturnDate: string;
  carCondition: string;
  paymentMethod: string;
  actualDays: number;
  totalRent: number;
  deposit: number;
  penaltyFee?: number;
  remaining: number;
  totalPayment: number;
  notes?: string;
}

export interface PenaltyRecord {
  id: string;
  returnId: string;
  customerName?: string;
  type: string;
  amount: number;
  notes?: string;
}

export interface Contract {
  id: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  cccd?: string;
  customerAddress?: string;
  driverLicense?: string;
  carId: string;
  carName?: string;
  carPlate?: string;
  carLicensePlate?: string;
  carImage?: string;
  carBrand?: string;
  pricePerDay?: number;
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

export interface LookupResponseData {
  contract: Contract;
  customer: {
    id: string;
    fullName: string;
    phone: string;
    email: string;
    cccd?: string;
    address?: string;
    driverLicense?: string;
  };
  returnRecord?: ReturnRecord | null;
  penalties?: PenaltyRecord[];
}

export interface CreateBookingRequest {
  carId: string;
  startDate: string;
  expectedReturnDate: string;
  pickupPoint: string;
  deposit?: number;
  totalAmount?: number;
  notes?: string;
  fullName?: string;
  phone?: string;
  email?: string;
  cccd?: string;
  driverLicense?: string;
  address?: string;
}
