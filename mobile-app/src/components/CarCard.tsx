import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Car } from '../types';
import { COLORS } from '../constants/colors';
import { CONFIG } from '../constants/config';
import { RADIUS, SHADOWS, SPACING } from '../constants/theme';
import { Badge } from './Badge';

interface CarCardProps {
  car: Car;
  onPress: () => void;
  style?: ViewStyle;
}

export const CarCard: React.FC<CarCardProps> = ({ car, onPress, style }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const isCurrentlyRented = car.status === 'Đang thuê' || car.publicStatus === 'Đang thuê';
  const isInspectionExpired = !isCurrentlyRented && (
    car.isInspectionExpired ||
    car.inspectionStatus === 'Hết hạn' ||
    car.publicStatus === 'Đăng kiểm' ||
    Boolean(car.inspectionExpiryDate && new Date(car.inspectionExpiryDate) < new Date())
  );

  const displayStatus = isCurrentlyRented
    ? 'Đang thuê'
    : isInspectionExpired
    ? 'Đăng kiểm'
    : (car.publicStatus || car.status);

  const canRent = !isInspectionExpired && car.status === 'Sẵn sàng' && car.publicStatus !== 'Đang thuê';

  const imageUrl = car.image
    ? car.image.startsWith('http')
      ? car.image
      : `${CONFIG.IMAGE_BASE_URL}${car.image}`
    : 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80';

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[styles.container, style]}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.badgeContainer}>
          <Badge label={displayStatus} />
        </View>
        <View style={styles.brandTag}>
          <Text style={styles.brandText}>{car.brand}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.carName} numberOfLines={1}>
          {car.name}
        </Text>

        <View style={styles.locationRow}>
          <Text style={styles.locationText} numberOfLines={1}>
            📍 {car.location || 'Khu vực Hà Nội'}
          </Text>
        </View>

        <View style={styles.specsRow}>
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>Số chỗ:</Text>
            <Text style={styles.specValue}>{car.seatCount} chỗ</Text>
          </View>
          <View style={styles.specDot} />
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>Nhiên liệu:</Text>
            <Text style={styles.specValue}>{car.fuelType}</Text>
          </View>
          <View style={styles.specDot} />
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>Đời:</Text>
            <Text style={styles.specValue}>{car.year}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View>
            <Text style={styles.priceLabel}>Giá thuê theo ngày</Text>
            <Text style={styles.priceValue}>{formatCurrency(car.price)}</Text>
          </View>

          <View style={[styles.actionBtn, !canRent && styles.actionBtnMuted]}>
            <Text style={[styles.actionBtnText, !canRent && styles.actionBtnTextMuted]}>
              {isInspectionExpired ? 'Đăng kiểm' : canRent ? 'Đặt xe' : 'Chi tiết'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgeContainer: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },
  brandTag: {
    position: 'absolute',
    bottom: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  brandText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: SPACING.md,
  },
  carName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#0369A1',
    fontWeight: '600',
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  specLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginRight: 2,
  },
  specValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  specDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.placeholder,
    marginHorizontal: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  priceLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  actionBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.md,
  },
  actionBtnMuted: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
  },
  actionBtnTextMuted: {
    color: '#64748B',
    fontWeight: '600',
  },
});
