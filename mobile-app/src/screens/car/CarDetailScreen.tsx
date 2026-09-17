import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { carApi } from '../../api/carApi';
import { Car } from '../../types';
import { Button, Badge, Loading, Header } from '../../components';
import { COLORS } from '../../constants/colors';
import { CONFIG } from '../../constants/config';
import { RADIUS, SPACING } from '../../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'CarDetail'>;

export const CarDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { carId, car: initialCar } = route.params;
  const [car, setCar] = useState<Car | null>(initialCar || null);
  const [loading, setLoading] = useState(!initialCar);

  useEffect(() => {
    const fetchCarDetail = async () => {
      try {
        const response = await carApi.getCarById(carId);
        if (response.success && response.data) {
          setCar(response.data);
        }
      } catch (error: any) {
        Alert.alert('Lỗi', error.message || 'Không thể tải chi tiết xe.');
      } finally {
        setLoading(false);
      }
    };

    if (!car) {
      fetchCarDetail();
    }
  }, [carId]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(val);
  };

  if (loading || !car) {
    return (
      <View style={styles.container}>
        <Header title="Chi Tiết Xe" onBack={() => navigation.goBack()} />
        <Loading message="Đang tải thông tin xe..." fullscreen />
      </View>
    );
  }

  const imageUrl = car.image
    ? car.image.startsWith('http')
      ? car.image
      : `${CONFIG.IMAGE_BASE_URL}${car.image}`
    : 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80';

  const isAvailable = car.status === 'Sẵn sàng';

  return (
    <View style={styles.container}>
      <Header
        title={car.name}
        subtitle={car.brand}
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Car Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
          <View style={styles.statusBadge}>
            <Badge label={car.status} />
          </View>
        </View>

        <View style={styles.body}>
          {/* Header Title & Price */}
          <View style={styles.titleSection}>
            <View>
              <Text style={styles.carName}>{car.name}</Text>
              <Text style={styles.carPlate}>Biển số: {car.licensePlate}</Text>
            </View>
            <View style={styles.priceCol}>
              <Text style={styles.priceNumber}>{formatCurrency(car.price)}</Text>
              <Text style={styles.priceUnit}>/ ngày</Text>
            </View>
          </View>

          {/* Specs Grid */}
          <Text style={styles.sectionHeading}>Thông Số Kỹ Thuật</Text>
          <View style={styles.specsGrid}>
            <View style={styles.specCard}>
              <Text style={styles.specIcon}>💺</Text>
              <Text style={styles.specKey}>Số chỗ ngồi</Text>
              <Text style={styles.specVal}>{car.seatCount} chỗ</Text>
            </View>
            <View style={styles.specCard}>
              <Text style={styles.specIcon}>⛽</Text>
              <Text style={styles.specKey}>Nhiên liệu</Text>
              <Text style={styles.specVal}>{car.fuelType}</Text>
            </View>
            <View style={styles.specCard}>
              <Text style={styles.specIcon}>📅</Text>
              <Text style={styles.specKey}>Năm sản xuất</Text>
              <Text style={styles.specVal}>{car.year}</Text>
            </View>
            <View style={styles.specCard}>
              <Text style={styles.specIcon}>🚘</Text>
              <Text style={styles.specKey}>Kiểu dáng</Text>
              <Text style={styles.specVal}>{car.type}</Text>
            </View>
          </View>

          {/* Notes & Features */}
          <Text style={styles.sectionHeading}>Mô Tả & Ghi Chú</Text>
          <View style={styles.notesBox}>
            <Text style={styles.notesText}>
              {car.notes ||
                'Xe được vệ sinh sạch sẽ, trang bị camera hành trình, bảo dưỡng định kỳ và đầy đủ giấy tờ hợp lệ.'}
            </Text>
          </View>

          {/* Rental Terms Policy */}
          <Text style={styles.sectionHeading}>Quy Định & Điều Khoản</Text>
          <View style={styles.policyBox}>
            <View style={styles.policyRow}>
              <Text style={styles.policyBullet}>•</Text>
              <Text style={styles.policyText}>
                Phạm vi nhận & trả xe: Trong toàn bộ khu vực Hà Nội.
              </Text>
            </View>
            <View style={styles.policyRow}>
              <Text style={styles.policyBullet}>•</Text>
              <Text style={styles.policyText}>
                Tiền đặt cọc: Thường là 30% tổng giá trị hợp đồng thuê xe.
              </Text>
            </View>
            <View style={styles.policyRow}>
              <Text style={styles.policyBullet}>•</Text>
              <Text style={styles.policyText}>
                Giấy tờ yêu cầu: CCCD gốc + Giấy phép lái xe hợp lệ.
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Bottom Booking Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceCol}>
          <Text style={styles.bottomPriceLabel}>Giá thuê:</Text>
          <Text style={styles.bottomPriceValue}>{formatCurrency(car.price)}</Text>
        </View>

        <Button
          title={isAvailable ? 'Tiến Hành Đặt Xe' : 'Xe Đang Bận'}
          onPress={() => navigation.navigate('Booking', { car })}
          disabled={!isAvailable}
          variant={isAvailable ? 'primary' : 'outline'}
          size="lg"
          style={styles.bookBtn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 240,
    backgroundColor: '#0F172A',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
  },
  body: {
    padding: SPACING.md,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  carName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  carPlate: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  priceCol: {
    alignItems: 'flex-end',
  },
  priceNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  priceUnit: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  specCard: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  specIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  specKey: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  specVal: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  notesBox: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  notesText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  policyBox: {
    backgroundColor: '#F8FAFC',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  policyBullet: {
    fontSize: 14,
    color: COLORS.primary,
  },
  policyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomPriceCol: {
    flex: 1,
  },
  bottomPriceLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  bottomPriceValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  bookBtn: {
    flex: 1.5,
    marginLeft: SPACING.md,
  },
});
