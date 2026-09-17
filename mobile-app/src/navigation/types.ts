import { NavigatorScreenParams } from '@react-navigation/native';
import { Car, Contract } from '../types';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  CarListTab: undefined;
  HistoryTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  CarDetail: { carId: string; car?: Car };
  Booking: { car: Car };
  ContractDetail: { contractId: string; contract?: Contract };
};
