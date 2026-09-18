import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { HomeScreen } from '../screens/home/HomeScreen';
import { CarListScreen } from '../screens/cars/CarListScreen';
import { MyRentalsScreen } from '../screens/rentals/MyRentalsScreen';
import { LookupScreen } from '../screens/lookup/LookupScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { COLORS } from '../constants/colors';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused }) => {
          let emoji = '🚗';
          if (route.name === 'HomeTab') emoji = '🏠';
          else if (route.name === 'CarListTab') emoji = '🚗';
          else if (route.name === 'HistoryTab') emoji = '📋';
          else if (route.name === 'LookupTab') emoji = '🔍';
          else if (route.name === 'ProfileTab') emoji = '👤';

          return (
            <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.65 }}>
              {emoji}
            </Text>
          );
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ tabBarLabel: 'Trang chủ' }}
      />
      <Tab.Screen
        name="CarListTab"
        component={CarListScreen}
        options={{ tabBarLabel: 'Danh mục xe' }}
      />
      <Tab.Screen
        name="HistoryTab"
        component={MyRentalsScreen}
        options={{ tabBarLabel: 'Đơn thuê' }}
      />
      <Tab.Screen
        name="LookupTab"
        component={LookupScreen}
        options={{ tabBarLabel: 'Tra cứu' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Cá nhân' }}
      />
    </Tab.Navigator>
  );
};
