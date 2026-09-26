import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { carApi } from '../../api/carApi';
import { Car, BookingSchedule } from '../../types';
import { Button, Badge, Loading, Header } from '../../components';
import { COLORS } from '../../constants/colors';
import { CONFIG } from '../../constants/config';
import { RADIUS, SHADOWS, SPACING } from '../../constants/theme';

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
        Alert.alert('Lỗi', error.message || 'Không thể tải chi tiết thông tin xe.');
      } finally {
        setLoading(false);
      }
    };

    fetchCarDetail();
  }, [carId]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(val);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Chưa có thông tin';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
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

  // Check inspection expiry
  const isInspectionExpired =
    car.isInspectionExpired ||
    (car.inspectionExpiryDate && new Date(car.inspectionExpiryDate) < new Date());

  // Check availability
  const isCarAvailable = car.status === 'Sẵn sàng' && !isInspectionExpired;

  const schedules: BookingSchedule[] = car.bookingSchedules || [];

  const handleBookPress = () => {
    if (!isCarAvailable) {
      if (isInspectionExpired) {
        Alert.alert(
          'Xe chưa đủ điều kiện lưu hành',
          'Xe này đã hết hạn đăng kiểm định kỳ. Hệ thống đang tiến hành kiểm định lại để đảm bảo an toàn tối đa cho khách hàng.'
        );
        return;
      }
      Alert.alert('Thông báo', `Xe hiện đang ở trạng thái "${car.status}". Vui lòng chọn xe khác.`);
      return;
    }

    navigation.navigate('Booking', { car });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <Header
        title={car.name}
        subtitle={`${car.brand} • ${car.year}`}
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Big Hero Image View */}
        <View style={styles.imageHeroWrap}>
          <Image source={{ uri: imageUrl }} style={styles.imageHero} resizeMode="cover" />
          <View style={styles.statusBadgeWrap}>
            <Badge label={isInspectionExpired ? 'Đăng kiểm' : (car.publicStatus || car.status)} />
          </View>
          <View style={styles.brandHeroTag}>
            <Text style={styles.brandHeroTagText}>{car.brand} • Đời {car.year}</Text>
          </View>
        </View>

        <View style={styles.body}>
          {/* Main Title & Price Row */}
          <View style={styles.headerTitleCard}>
            <View style={styles.headerInfoCol}>
              <Text style={styles.carTitleName}>{car.name}</Text>
              <View style={styles.plateRow}>
                <Text style={styles.plateLabel}>Biển kiểm soát:</Text>
                <View style={styles.plateBadge}>
                  <Text style={styles.plateBadgeText}>{car.licensePlate}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                <Text style={{ fontSize: 13, color: '#0369A1', fontWeight: '700' }}>
                  📍 {car.location || 'Khu vực Hà Nội'}
                </Text>
              </View>
            </View>
            <View style={styles.headerPriceCol}>
              <Text style={styles.pricePerDay}>{formatCurrency(car.price)}</Text>
              <Text style={styles.priceUnitText}>/ 24 giờ</Text>
            </View>
          </View>

          {/* Inspection Warning Banner if Expired */}
          {isInspectionExpired ? (
            <View style={styles.expiredWarningBanner}>
              <Text style={styles.expiredWarningIcon}>⚠️</Text>
              <View style={styles.expiredWarningTextCol}>
                <Text style={styles.expiredWarningHeading}>Cảnh Báo: Xe Hết Hạn Đăng Kiểm</Text>
                <Text style={styles.expiredWarningDesc}>
                  Hạn đăng kiểm của xe: {formatDate(car.inspectionExpiryDate)}. Tạm ngừng nhận đặt thuê để đảm bảo quy định an toàn giao thông đường bộ.
                </Text>
              </View>
            </View>
          ) : car.inspectionExpiryDate ? (
            <View style={styles.validInspectionBanner}>
              <Text style={styles.validInspectionIcon}>🛡️</Text>
              <View style={styles.validInspectionTextCol}>
                <Text style={styles.validInspectionHeading}>Đăng Kiểm Hợp Lệ & Đầy Đủ</Text>
                <Text style={styles.validInspectionDesc}>
                  Hạn kiểm định đến ngày: <Text style={{ fontWeight: '700' }}>{formatDate(car.inspectionExpiryDate)}</Text>
                </Text>
              </View>
            </View>
          ) : null}

          {/* Technical Specifications Table */}
          <Text style={styles.sectionTitle}>Thông Số Kỹ Thuật Xe</Text>
          <View style={styles.specsGrid}>
            <View style={styles.specBox}>
              <Text style={styles.specEmoji}>🚘</Text>
              <Text style={styles.specName}>Kiểu dáng</Text>
              <Text style={styles.specValue}>{car.type}</Text>
            </View>

            <View style={styles.specBox}>
              <Text style={styles.specEmoji}>💺</Text>
              <Text style={styles.specName}>Số chỗ ngồi</Text>
              <Text style={styles.specValue}>{car.seatCount} chỗ</Text>
            </View>

            <View style={styles.specBox}>
              <Text style={styles.specEmoji}>⛽</Text>
              <Text style={styles.specName}>Nhiên liệu</Text>
              <Text style={styles.specValue}>{car.fuelType}</Text>
            </View>

            <View style={styles.specBox}>
              <Text style={styles.specEmoji}>📅</Text>
              <Text style={styles.specName}>Năm sản xuất</Text>
              <Text style={styles.specValue}>{car.year}</Text>
            </View>

            <View style={styles.specBox}>
              <Text style={styles.specEmoji}>🏢</Text>
              <Text style={styles.specName}>Hãng sản xuất</Text>
              <Text style={styles.specValue}>{car.brand}</Text>
            </View>

            <View style={styles.specBox}>
              <Text style={styles.specEmoji}>📋</Text>
              <Text style={styles.specName}>Đăng kiểm</Text>
              <Text
                style={[
                  styles.specValue,
                  isInspectionExpired && { color: COLORS.error },
                ]}
              >
                {isInspectionExpired ? 'Hết hạn' : 'Đạt chuẩn'}
              </Text>
            </View>
          </View>

          {/* Booking Schedules (Lịch đã đặt trước) */}
          <Text style={styles.sectionTitle}>Lịch Đã Đặt Trước Của Xe</Text>
          <View style={styles.scheduleBox}>
            {schedules.length === 0 ? (
              <View style={styles.scheduleEmpty}>
                <Text style={styles.scheduleEmptyIcon}>✅</Text>
                <Text style={styles.scheduleEmptyText}>
                  Xe chưa có lịch đặt trước nào trong thời gian tới. Bạn có thể thuê ngay!
                </Text>
              </View>
            ) : (
              <View style={styles.scheduleList}>
                <Text style={styles.scheduleNotice}>
                  💡 Xe đã được đặt trong các khoảng ngày sau (vui lòng chọn ngày khác):
                </Text>
                {schedules.map((item, index) => (
                  <View key={`sched-${index}`} style={styles.scheduleItem}>
                    <View style={styles.scheduleDot} />
                    <View style={styles.scheduleContent}>
                      <Text style={styles.scheduleDateRange}>
                        {formatDate(item.startDate)} ➔ {formatDate(item.endDate)}
                      </Text>
                      <Text style={styles.scheduleStatus}>
                        Mã HĐ: {item.contractId} • {item.status}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Car Description & Amenities */}
          <Text style={styles.sectionTitle}>Mô Tả & Trang Bị</Text>
          <View style={styles.notesContainer}>
            <Text style={styles.notesBody}>
              {car.notes ||
                'Xe gia đình giữ gìn sạch sẽ, nội thất da cao cấp, trang bị camera lùi, cảm biến va chạm, màn hình Android kết nối Apple CarPlay & Android Auto, lốp dự phòng và bộ dụng cụ cứu hộ tiêu chuẩn.'}
            </Text>
            <View style={styles.amenitiesWrap}>
              <View style={styles.amenityChip}>
                <Text style={styles.amenityChipText}>✓ Camera lùi / 360</Text>
              </View>
              <View style={styles.amenityChip}>
                <Text style={styles.amenityChipText}>✓ Bluetooth / Apple CarPlay</Text>
              </View>
              <View style={styles.amenityChip}>
                <Text style={styles.amenityChipText}>✓ Cảm biến áp suất lốp</Text>
              </View>
              <View style={styles.amenityChip}>
                <Text style={styles.amenityChipText}>✓ Bản đồ dẫn đường GPS</Text>
              </View>
              <View style={styles.amenityChip}>
                <Text style={styles.amenityChipText}>✓ Vệ sinh khử khuẩn</Text>
              </View>
            </View>
          </View>

          {/* Rental Terms Policy */}
          <Text style={styles.sectionTitle}>Chính Sách & Thủ Tục Nhận Xe</Text>
          <View style={styles.policyCard}>
            <View style={styles.policyItem}>
              <Text style={styles.policyNumber}>1</Text>
              <View style={styles.policyTextWrap}>
                <Text style={styles.policyHead}>Giấy tờ nhận xe</Text>
                <Text style={styles.policyDesc}>
                  Xuất trình bản gốc CCCD/Hộ chiếu và Giấy phép lái xe hạng B1/B2 trở lên hợp lệ.
                </Text>
              </View>
            </View>

            <View style={styles.policyItem}>
              <Text style={styles.policyNumber}>2</Text>
              <View style={styles.policyTextWrap}>
                <Text style={styles.policyHead}>Tiền đặt cọc</Text>
                <Text style={styles.policyDesc}>
                  Đặt cọc 30% giá trị hợp đồng khi đặt giữ xe và thanh toán phần còn lại khi nhận xe.
                </Text>
              </View>
            </View>

            <View style={styles.policyItem}>
              <Text style={styles.policyNumber}>3</Text>
              <View style={styles.policyTextWrap}>
                <Text style={styles.policyHead}>Địa điểm giao nhận xe</Text>
                <Text style={styles.policyDesc}>
                  Giao xe tận nơi miễn phí trong bán kính 10km tại khu vực nội thành Hà Nội.
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Fixed Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceWrap}>
          <Text style={styles.bottomPriceLabel}>Giá thuê xe:</Text>
          <Text style={styles.bottomPriceValue}>{formatCurrency(car.price)}</Text>
          <Text style={styles.bottomPriceNote}>/ ngày (24h)</Text>
        </View>

        <Button
          title={
            isInspectionExpired
              ? 'Hết Hạn Đăng Kiểm'
              : isCarAvailable
              ? 'Đặt Xe Ngay ➔'
              : `Xe ${car.status}`
          }
          onPress={handleBookPress}
          disabled={!isCarAvailable}
          variant={isCarAvailable ? 'primary' : 'outline'}
          size="lg"
          style={styles.bottomActionBtn}
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
  imageHeroWrap: {
    width: '100%',
    height: 250,
    backgroundColor: '#0F172A',
    position: 'relative',
  },
  imageHero: {
    width: '100%',
    height: '100%',
  },
  statusBadgeWrap: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
  },
  brandHeroTag: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.md,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.md,
  },
  brandHeroTagText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  body: {
    padding: SPACING.md,
  },
  headerTitleCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  headerInfoCol: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  carTitleName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  plateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  plateLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  plateBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  plateBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  headerPriceCol: {
    alignItems: 'flex-end',
  },
  pricePerDay: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  priceUnitText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  expiredWarningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  expiredWarningIcon: {
    fontSize: 22,
  },
  expiredWarningTextCol: {
    flex: 1,
  },
  expiredWarningHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.error,
    marginBottom: 2,
  },
  expiredWarningDesc: {
    fontSize: 12,
    color: '#991B1B',
    lineHeight: 16,
  },
  validInspectionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  validInspectionIcon: {
    fontSize: 20,
  },
  validInspectionTextCol: {
    flex: 1,
  },
  validInspectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#166534',
  },
  validInspectionDesc: {
    fontSize: 12,
    color: '#15803D',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
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
  specBox: {
    flexBasis: '31%',
    flexGrow: 1,
    backgroundColor: COLORS.white,
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    ...SHADOWS.card,
  },
  specEmoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  specName: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  specValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
    textAlign: 'center',
  },
  scheduleBox: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  scheduleEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  scheduleEmptyIcon: {
    fontSize: 20,
  },
  scheduleEmptyText: {
    fontSize: 13,
    color: '#166534',
    flex: 1,
    fontWeight: '600',
  },
  scheduleList: {
    gap: 8,
  },
  scheduleNotice: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  scheduleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.warning,
  },
  scheduleContent: {
    flex: 1,
  },
  scheduleDateRange: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  scheduleStatus: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  notesContainer: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  notesBody: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
    marginBottom: SPACING.sm,
  },
  amenitiesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  amenityChip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  amenityChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  policyCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
    ...SHADOWS.card,
  },
  policyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  policyNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primaryMuted,
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 24,
  },
  policyTextWrap: {
    flex: 1,
  },
  policyHead: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  policyDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
    lineHeight: 16,
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
    ...SHADOWS.elevated,
  },
  bottomPriceWrap: {
    flex: 1,
  },
  bottomPriceLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  bottomPriceValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  bottomPriceNote: {
    fontSize: 10,
    color: COLORS.placeholder,
  },
  bottomActionBtn: {
    flex: 1.5,
    marginLeft: SPACING.md,
  },
});
