import { NavigatorScreenParams } from '@react-navigation/native';
import { Car, Contract, LookupResponseData } from '../types';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  CarListTab: undefined;
  HistoryTab: undefined;
  LookupTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  CarDetail: { carId: string; car?: Car };
  Booking: { car: Car };
  BookingSuccess: { contract: Contract };
  RentalDetail: { contractId: string; contract?: Contract; lookupData?: LookupResponseData };
  ContractDetail: { contractId: string; contract?: Contract };
  Lookup: undefined;
};
