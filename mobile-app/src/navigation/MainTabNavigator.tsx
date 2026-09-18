import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { HomeScreen } from '../screens/home/HomeScreen';
import { CarListScreen } from '../screens/cars/CarListScreen';
import { MyRentalsScreen } from '../screens/rentals/MyRentalsScreen';
import { LookupScreen } from '../screens/lookup/LookupScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { COLORS } from '../constants/colors';
import { SHADOWS } from '../constants/theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#64748B',
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 6,
          paddingTop: 6,
          ...SHADOWS.card,
        },
        tabBarItemStyle: {
          flex: 1,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 2,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 2,
          marginBottom: 2,
        },
        tabBarIcon: ({ focused }) => {
          let emoji = '🚗';
          if (route.name === 'HomeTab') emoji = '🏠';
          else if (route.name === 'CarListTab') emoji = '🚗';
          else if (route.name === 'HistoryTab') emoji = '📋';
          else if (route.name === 'LookupTab') emoji = '🔍';
          else if (route.name === 'ProfileTab') emoji = '👤';

          return (
            <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
              <Text style={[styles.iconEmoji, focused && styles.iconEmojiFocused]}>
                {emoji}
              </Text>
            </View>
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
        options={{ tabBarLabel: 'Danh mục' }}
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
        options={{ tabBarLabel: 'Tài khoản' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    width: 32,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerFocused: {
    backgroundColor: '#DBEAFE',
  },
  iconEmoji: {
    fontSize: 18,
    opacity: 0.65,
  },
  iconEmojiFocused: {
    fontSize: 18,
    opacity: 1,
  },
});
