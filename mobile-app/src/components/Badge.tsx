import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../constants/colors';
import { RADIUS } from '../constants/theme';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant, style }) => {
  const getBadgeStyle = () => {
    let currentVariant = variant;

    if (!currentVariant) {
      if (['Sẵn sàng', 'Đã hoàn thành', 'Còn hạn', 'Hoàn thành'].includes(label)) {
        currentVariant = 'success';
      } else if (['Đang thuê', 'Đang hiệu lực'].includes(label)) {
        currentVariant = 'info';
      } else if (['Chờ xác nhận', 'Bảo trì', 'Sắp hết hạn', 'Đang bảo trì', 'Đặt thuê'].includes(label)) {
        currentVariant = 'warning';
      } else if (['Đã hủy', 'Hết hạn', 'Tạm khóa', 'Đăng kiểm', 'Hết đăng kiểm'].includes(label)) {
        currentVariant = 'danger';
      } else {
        currentVariant = 'default';
      }
    }

    switch (currentVariant) {
      case 'success':
        return {
          bg: COLORS.successLight,
          text: '#065F46',
        };
      case 'info':
        return {
          bg: COLORS.infoLight,
          text: '#075985',
        };
      case 'warning':
        return {
          bg: COLORS.warningLight,
          text: '#92400E',
        };
      case 'danger':
        return {
          bg: COLORS.dangerLight,
          text: '#991B1B',
        };
      default:
        return {
          bg: '#F1F5F9',
          text: '#475569',
        };
    }
  };

  const badgeTheme = getBadgeStyle();

  return (
    <View style={[styles.badge, { backgroundColor: badgeTheme.bg }, style]}>
      <Text style={[styles.text, { color: badgeTheme.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
